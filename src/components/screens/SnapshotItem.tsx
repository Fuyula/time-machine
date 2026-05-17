import { ChevronDown, FileQuestion, Upload } from 'lucide-react';
import { Card } from '../ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { Button } from '../ui/button';
import DeletionDialog from './DeletionDialog';
import { Badge } from '../ui/badge';
import type { Snapshot, Tab } from '@/types';

const SnapshotItem = ({
  remove,
  restore,
  snapshot,
}: {
  snapshot: Snapshot;
  restore: () => void;
  remove: () => void;
}) => {
  return (
    <Card className='w-full'>
      <Collapsible className='w-full'>
        <div className='flex items-center justify-between px-3 py-2'>
          <CollapsibleTrigger asChild>
            <button className='flex items-center gap-2 flex-1 text-left'>
              <ChevronDown className='size-4 transition-transform group-data-[state=open]:rotate-180' />
              <strong>{snapshot.label}</strong>
            </button>
          </CollapsibleTrigger>

          <div className='flex gap-1'>
            <Button size='icon' variant='outline' onClick={restore}>
              <Upload className='size-4' />
            </Button>
            <DeletionDialog remove={remove} />
          </div>
        </div>

        <div className='flex gap-2 px-3'>
          <Badge variant='secondary'>
            {new Date(snapshot.timestamp).toLocaleString()}
          </Badge>
          <Badge>{snapshot.tabs.length} tabs</Badge>
        </div>

        <CollapsibleContent className='px-3 pb-3'>
          <ul className='flex flex-col gap-1 text-sm'>
            {snapshot.tabs.map((tab: Tab, i: number) => (
              <li
                key={i}
                className='flex items-center gap-2 ps-8 text-ellipsis text-zinc-400'
              >
                {tab.favIconUrl ? (
                  <img
                    src={tab.favIconUrl}
                    alt=''
                    className='size-4 shrink-0'
                  />
                ) : (
                  <FileQuestion className='size-4 shrink-0' />
                )}
                <span className='text-ellipsis'>{tab.title ?? tab.url}</span>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SnapshotItem;
