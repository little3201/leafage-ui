import type { HTMLAttributeAnchorTarget } from 'react';

export interface Pagination {
  page: number,
  size: number,
  sortBy?: string,
  descending?: boolean
}

interface AudtiMetadata {
  id: number | undefined
  lastModifiedDate?: Date
}

export interface User extends AudtiMetadata {
  username: string
  fullname: string
  email: string
  avatar?: string
  accountNonLocked?: boolean
  accountExpiresAt?: Date
  credentialsExpiresAt?: Date
  enabled?: boolean
}

export interface MenuModel {
    label: string;
    icon?: string;
    items?: MenuModel[];
    to?: string;
    url?: string;
    target?: HTMLAttributeAnchorTarget;
    seperator?: boolean;
}

type CommandProps = {
    originalEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>;
    item: MenuModelItem;
};
export interface AppMenuItem extends MenuModel {
    items?: AppMenuItem[];
    badge?: 'UPDATED' | 'NEW';
    badgeClass?: string;
    class?: string;
    preventExact?: boolean;
    visible?: boolean;
    disabled?: boolean;
    replaceUrl?: boolean;
    command?: ({ originalEvent, item }: CommandProps) => void;
}

export interface AppMenuItemProps {
    item?: AppMenuItem;
    parentKey?: string;
    index?: number;
    root?: boolean;
    className?: string;
}