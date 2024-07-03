import { jwtVerify } from 'jose'

export const validateJwt = async (jwt: string): Promise<Boolean> => {
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

export const parseClaims = (jwt: string): Record<string, any> => {
    const claims = jwt.split('.')[1]
    const decodedClaims = Buffer.from(claims, 'base64').toString()
    return JSON.parse(decodedClaims)
}
