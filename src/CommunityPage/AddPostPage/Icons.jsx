import React from "react";
import {
  ChevronRight,
  Link2,
  Minus,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Indent,
  Outdent,
  Edit,
  Smile,
  AlertCircle,
} from "lucide-react";

// Icons with black color
const ChevronRightIcon = () => <ChevronRight size={20} color="black" />;
const LinkIcon = () => <Link2 size={24} color="black" />;
const HorizontalLineIcon = () => <Minus size={24} color="black" />;
const BoldIcon = () => <Bold size={24} color="black" />;
const ItalicIcon = () => <Italic size={24} color="black" />;
const UnderlineIcon = () => <Underline size={24} color="black" />;
const StrikethroughIcon = () => <Strikethrough size={24} color="black" />;
const BulletListIcon = () => <List size={24} color="black" />;
const NumberedListIcon = () => <ListOrdered size={24} color="black" />;
const AlignCenterIcon = () => <AlignCenter size={24} color="black" />;
const AlignLeftIcon = () => <AlignLeft size={24} color="black" />;
const AlignRightIcon = () => <AlignRight size={24} color="black" />;
const IndentIncreaseIcon = () => <Indent size={24} color="black" />;
const IndentDecreaseIcon = () => <Outdent size={24} color="black" />;
const PencilIcon = () => <Edit size={16} color="black" />;
const SmileIcon = () => <Smile size={24} color="black" />;
const AlertIcon = () => <AlertCircle size={16} color="red" />;

export {
  ChevronRightIcon,
  LinkIcon,
  HorizontalLineIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  BulletListIcon,
  NumberedListIcon,
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  IndentIncreaseIcon,
  IndentDecreaseIcon,
  PencilIcon,
  SmileIcon,
  AlertIcon,
};