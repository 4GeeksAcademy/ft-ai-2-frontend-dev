interface HelloWorldProps {
  name: string
}

export function HelloWorld({ name }: HelloWorldProps) {
  return <p>Hello, {name}!</p>
}
