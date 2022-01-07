import React, { useEffect } from 'react';
import useShellColor from '../useShellColor';

export default function ReactShellColor(props: { text: string; onFresh?: () => void }) {
  const { text, onFresh } = props;
  const { tags } = useShellColor(text);
  useEffect(() => {
    onFresh && onFresh();
  }, [tags]);
  return <>{tags}</>;
}
