export default function PollDetail({ params }: { params: { id: string } }) {
    return (
        <div>
            <h1>Details of {params.id}</h1>
        </div>
    )
}
