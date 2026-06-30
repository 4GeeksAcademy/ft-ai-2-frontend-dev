// Server components let you do things with secrets
// and then you only send the resulting html to the frontend.
// Server components are static, meaning they don't change
// after load unless you do some real jank things.

const getEnvData = async () => {
    const resp = await fetch("https://library.dotlag.space/library");
    const data = await resp.json()
    return data.books?.map((book, idx) => <li key={idx}>{book.title}</li>)
}

export default function ServerComponent() {
    return <div>
        <h1>This does have access to server-side data:</h1>
        <ul>
            {getEnvData()}
        </ul>
    </div>
}
