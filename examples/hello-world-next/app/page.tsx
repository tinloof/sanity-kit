import sanity from "@/lib/sanity";

export default async function Home() {
  const {data} = await sanity.sanityFetch({
    query: `*[_type == "article"]`,
  });

  return (
    <main>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
