import React, { useEffect, useRef, useState } from 'react';
import ShellColor from '../shell-color';
import { SGRStyle } from '../shell-color/sgr';

export default function useShellColor(text: string): {
  tags: React.ReactNode[];
  shellColor: ShellColor;
} {
  const sc = useRef(new ShellColor()).current;
  const [tags, setTags] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    sc.on('reset', function () {
      setTags([]);
    });

    sc.on('snippet', function (tag: React.ReactNode, text: string, style: SGRStyle) {
      setTags((inner) => {
        inner.push(tag);
        return inner;
      });
    });

    // sc.on('lineEnd', function() {
    //   const br = document.createElement('br')
    //   setTags((inner) => {
    //     inner.appendChild(br);
    //     return inner;
    //   })
    // })
  }, []);

  useEffect(() => {
    sc.reset().write(text);
  }, [text]);

  return {
    tags,
    shellColor: sc,
  };
}
