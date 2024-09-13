import { useEffect, useState } from "react";

export default function Post({ slug }: { slug: string }) {
  const [post, setPost] = useState<React.ReactNode | null>(null);
  useEffect(() => {
    import(`../posts/${slug}.md`).then((module) => {
      setPost(() => {
        const Component = module.default;
        return <Component />;
      });
    });
  }, [slug]);

  return post;
}
