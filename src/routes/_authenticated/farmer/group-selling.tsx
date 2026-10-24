import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/farmer/group-selling")({
  head: () => ({
    meta: [
      { title: "Group-Selling — FarmBridge" },
      { name: "description", content: "FarmBridge marketplace page." },
      { property: "og:title", content: "Group-Selling — FarmBridge" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Placeholder,
});

function Placeholder() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Group-Selling</h1>
      <p className="mt-2 text-muted-foreground">This workspace is being wired up. Check back in a moment.</p>
    </div>
  );
}
