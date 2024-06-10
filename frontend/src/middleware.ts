import { MiddlewareConfig, NextRequest, NextResponse } from 'next/server'
import cookie from 'cookie'
import { jwtVerify } from 'jose'
import { apiService } from './services/apiService/apiService'

const validateJwt = async (jwt: string): Promise<Boolean> => {
    const secret = new TextEncoder().encode('s3cr3t') // Replace with your actual secret
    try {
        const result = await jwtVerify(jwt, secret)
        console.log('JWT validation result:', result)
        return true
    } catch (error) {
        console.error('JWT validation failed:', error)
        return false
    }
}

const parseClaims = (jwt: string): Record<string, any> => {
    const claims = jwt.split('.')[1]
    const decodedClaims = Buffer.from(claims, 'base64').toString()
    return JSON.parse(decodedClaims)
}

const tryRefreshToken = async (publicAddress: string, refresh_token: string): Promise<string | null> => {
    try {
        const headers = { cookie: `refresh=${refresh_token}` }
        const response = await apiService.refreshJwt({ publicAddress }, headers)
        console.log(response)

        return response.jwt
    } catch (error) {
        console.error('Failed to refresh JWT:', error)
        return null
    }
}

const withRewritenCookieHeader = (requestHeaders: Headers, parsedCookies: Record<string, string>): Headers => {
    const serializedCookies = []
    for (const [key, value] of Object.entries(parsedCookies)) {
        serializedCookies.push(cookie.serialize(key, value))
    }

    const newRequestHeaders = new Headers(requestHeaders)
    newRequestHeaders.set('cookie', serializedCookies.join('; '))
    return newRequestHeaders
}

export async function middleware(request: NextRequest) {
    let parsedCookies = cookie.parse(request.headers.get('cookie') || '')
    let newRequestHeaders = withRewritenCookieHeader(request.headers, parsedCookies)
    const { origin } = request.nextUrl

    if (!parsedCookies['jwt']) {
        return NextResponse.redirect(`${origin}/login`)
    }

    const isValid = await validateJwt(parsedCookies['jwt'])

    if (!isValid) {
        console.log('JWT is invalid')
        const jwtClaims = parseClaims(parsedCookies['jwt'])

        console.log('Parsed cookies:', parsedCookies)
        console.log('JWT claims:', jwtClaims)

        if (jwtClaims.exp < Date.now() / 1000) {
            const publicAddress = jwtClaims.public_address
            const newJwt = await tryRefreshToken(publicAddress, parsedCookies['refresh'])

            console.log('New JWT:', newJwt)

            if (newJwt) {
                parsedCookies = { ...parsedCookies, jwt: newJwt }
                newRequestHeaders = withRewritenCookieHeader(request.headers, parsedCookies)
            } else {
                return NextResponse.redirect(`${origin}/login`)
            }
        } else {
            return NextResponse.redirect(`${origin}/login`)
        }
    }

    const response = NextResponse.next({
        request: {
            headers: newRequestHeaders,
        },
    })
    for (const [key, value] of Object.entries(parsedCookies)) {
        response.cookies.set(key, value)
    }

    return response
}

export const config: MiddlewareConfig = {
    matcher: ['/poll/:path*'],
}
