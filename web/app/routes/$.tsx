import { LoaderFunctionArgs } from "@remix-run/cloudflare";



export async function loader({ context }: LoaderFunctionArgs) {
  return Response.json(null, { status: 404 });
}

export default function FourOhFour() {
  return (
    <div>
      <h1>404 - Not Found. Work in progress...</h1>
    </div>
  );
}