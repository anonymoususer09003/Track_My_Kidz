import { useState, useCallback, useEffect, useRef } from "react";

export default () => {
  let abortControllerRef = useRef<AbortController>(new AbortController());

  return { abortControllerRef };
};
