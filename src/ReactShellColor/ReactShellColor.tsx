import React from 'react';
import useShellColor from '../useShellColor';

export default function ReactShellColor(props: { text: string }) {
  const { text } = props;
  const { tags } = useShellColor(text);
  return <>{tags}</>;
}
