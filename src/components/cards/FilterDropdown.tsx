import { ChevronDown, Check, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-[#272420] bg-[#1a1814] text-xs font-normal text-[#9ea9bb] hover:border-[#ff7a3d]/40 hover:bg-[#202018] hover:text-[#f4f6fb]"
        >
          <Filter className="h-3.5 w-3.5 text-[#ff7a3d]" />
          <span>
            {label}: <strong className="font-semibold text-foreground">{value}</strong>
          </span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px] border-[#2c2a24] bg-[#141310] text-[#ccd3e2]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onChange(option)}
            className="flex items-center justify-between text-xs hover:bg-[#22201a] hover:text-[#ff7a3d]"
          >
            <span className={value === option ? 'font-semibold text-[#ff7a3d]' : ''}>
              {option}
            </span>
            {value === option && <Check className="h-3.5 w-3.5 text-[#ff7a3d]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
