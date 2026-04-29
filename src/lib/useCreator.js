import { useState, useEffect } from "react";

export function useCreator(authorId) {
  const [creator, setCreator] = useState(null);

  useEffect(() => {
    if (!authorId) return;
    fetch(`/api/creators/${authorId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not Found");
        return res.json();
      })
      .then((data) => setCreator(data.creator))
      .catch(console.error);
  }, [authorId]);

  return creator;
}