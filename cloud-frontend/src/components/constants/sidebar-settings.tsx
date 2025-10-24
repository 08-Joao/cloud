import { 
  Home, 
  Settings, 
  FolderOpen,
  Document,
  UsersGroupRounded,
  Document2,
  Folder,
} from "@solar-icons/react/ssr";

interface ChildOption {
  name: string
  icon: React.ReactElement
  page: string
}

export interface CategoryOption {
  name: string
  icon: React.ReactElement
  page: string
  childs?: ChildOption[]
}

interface MenuOptions {
  [categoryName: string]: CategoryOption[]
}

export const sidebarOptions: MenuOptions = {
  "Principal": [
    {
      name: "Início",
      icon: <Home weight='BoldDuotone' size={20} />,
      page: "/dashboard"
    },
    {
      name: "My Folders",
      icon: <FolderOpen weight='BoldDuotone' size={20}/>,
      page: "/folders"
    },
    {
      name: "My Files",
      icon: <Document weight='BoldDuotone' size={20}/>,
      page: "/folder/myFiles"
    }
  ],
  "Compartilhamento": [
    {
      name: "Shared Folders",
      icon: <Folder weight='BoldDuotone' size={20}/>,
      page: "/shared/folders",
      childs: [
        {
          name: "Shared With Me",
          icon: <UsersGroupRounded weight='BoldDuotone' size={18}/>,
          page: "/shared/folders/received"
        },
        {
          name: "Shared By Me",
          icon: <UsersGroupRounded weight='BoldDuotone' size={18}/>,
          page: "/shared/folders/sent"
        }
      ]
    },
    {
      name: "Shared Files",
      icon: <Document2 weight='BoldDuotone' size={20}/>,
      page: "/shared/files",
      childs: [
        {
          name: "Shared With Me",
          icon: <UsersGroupRounded weight='BoldDuotone' size={18}/>,
          page: "/shared/files/received"
        },
        {
          name: "Shared By Me",
          icon: <UsersGroupRounded weight='BoldDuotone' size={18}/>,
          page: "/shared/files/sent"
        }
      ]
    }
  ],
  "Settings": [
    {
      name: "Profile",
      icon: <Settings weight='BoldDuotone' size={20}/>,
      page: "/settings/profile"
    }
  ]
}