import React, { useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd/es/select';
import { debounce } from 'lodash';

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}

function DebounceSelect<
  ValueType extends { key?: React.Key; label: React.ReactNode; value: string | number } = any,
>({ fetchOptions, debounceTimeout = 800, ...props }: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const fetchRef = useRef(0);

  const loadOptions = (value: string) => {
    fetchRef.current += 1;
    const fetchId = fetchRef.current;

    setOptions([]);
    setFetching(true);

    fetchOptions(value).then((newOptions) => {
      if (fetchId !== fetchRef.current) {
        // for fetch callback order
        return;
      }

      setOptions(newOptions);
      setFetching(false);
    });
  };

  const debounceFetcher = useMemo(() => {
    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);
  
  // Initial load can be done if needed, but usually we wait for search
  // useEffect(() => { loadOptions(''); }, []);

  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  );
} // End of DebounceSelect

export default DebounceSelect;
