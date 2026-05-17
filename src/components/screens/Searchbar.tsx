import { CircleX, Search } from 'lucide-react';
import { Button } from '../ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../ui/input-group';
import { useState } from 'react';

interface SearchbarProps {
  handleSearch: (...args: unknown[]) => void;
  search: string | undefined;
  setSearch: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const Searchbar = ({
  handleSearch,
  search,
  setSearch,
}: SearchbarProps) => {
  const [inputValue, setInputValue] = useState('');
  return (
    <InputGroup>
      <InputGroupInput
        value={inputValue}
        placeholder='Search...'
        onChange={(e) => {
          setInputValue(e.target.value);
          handleSearch(e.target.value);
        }}
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      {search && (
        <InputGroupAddon align='inline-end'>
          <Button
            size='icon-sm'
            variant='ghost'
            onClick={() => {
              setInputValue('');
              setSearch(undefined);
            }}
          >
            <CircleX />
          </Button>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
};
