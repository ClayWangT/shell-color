import React, { useEffect, useRef, useState } from 'react';
import ShellColor from '../shell-color';
import { SGRStyle } from '../shell-color/sgr';

export default function useShellColor(text: string): {
  tags: React.ReactNode[];
  shellColor: ShellColor;
} {
  const sc = useRef(new ShellColor()).current;
  const reactTags = useRef<React.ReactNode[]>([]);
  const [tags, setTags] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    sc.on('reset', function () {
      reactTags.current = [];
      setTags([]);
    });

    sc.on('snippet', function (tag: React.ReactNode, text: string, style: SGRStyle) {
      reactTags.current.push(tag);
    });

    sc.on('lineEnd', function () {
      const br = React.createElement('br');
      reactTags.current.push(br);
    });
  }, []);

  useEffect(() => {
    sc.reset().write(text);
    setTags(reactTags.current);
  }, [text, reactTags]);

  return {
    tags,
    shellColor: sc,
  };
}
