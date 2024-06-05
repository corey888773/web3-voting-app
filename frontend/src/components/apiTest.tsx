import { apiService } from '@/services/apiService/apiService'
export default function ApiTest() {
    const hello = async () => {
        const response = await apiService.hello()
        console.log(response)
    }

    return <button onClick={hello}>Hello</button>

    return <div>ApiTest</div>
}
