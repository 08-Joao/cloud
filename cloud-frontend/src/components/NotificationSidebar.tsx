// 'use client'

// import { NotificationEntity } from '@/entities/notification.entity'
// import { NotificationType } from '@/enums/notificationType'
// import Api from '@/services/Api'
// import { Button } from '@/components/ui/button'
// import React, { useEffect, useState } from 'react'
// import { 
//   Bell, 
//   Check, 
//   X, 
//   Users, 
//   Calendar, 
//   Clock,
//   Info
// } from 'lucide-react'
// import { CheckRead, TrashBin2 } from '@solar-icons/react/ssr'
// import { useWebSocket } from '@/context/NotificationsWebsocketContext'

// interface NotificationSidebarProps {
//   isOpen: boolean
//   onClose: () => void
// }

// function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
//   const [notifications, setNotifications] = useState<NotificationEntity[]>([])
//   const [loadingActions, setLoadingActions] = useState<Record<string, 'accept' | 'decline'>>({})
  
//   // Usar o hook do contexto para acessar o socket e o status de conexão
//   const { socket, isConnected } = useWebSocket()

//   const fetchNotifications = async () => {
//     const response = await Api.getUserNotifications()

//     if(response && response.data) {
//       setNotifications(response.data)
//     }
//   }

//   useEffect(() => {
//     // Carregar notificações iniciais
//     if(!notifications.length) {
//       fetchNotifications()
//     }
//   }, [])

//   useEffect(() => {
//     // Configurar listener para novas notificações vindas do Socket.IO
//     if (!socket) return

//     const handleNotification = (newNotification: NotificationEntity) => {
//       console.log('📬 Nova notificação recebida:', newNotification)
//       setNotifications((prevNotifications) => [newNotification, ...prevNotifications])
//     }

//     // Socket.IO usa .on() para escutar eventos
//     socket.on('notification', handleNotification)

//     // Cleanup: remover listener quando o componente desmontar ou socket mudar
//     return () => {
//       socket.off('notification', handleNotification)
//     }
//   }, [socket])

//   const handleAccept = async (actionUrl: string, notificationId: string) => {
//     setLoadingActions(prev => ({ ...prev, [notificationId]: 'accept' }))
//     try {
//       const response = await Api.acceptInvitation(actionUrl)
//       if (response) {
//         console.log('Notificação aceita com sucesso!')
//         setNotifications(prev => prev.filter(n => n.id !== notificationId))
//       }
//     } catch (error) {
//       console.error('Erro ao aceitar convite:', error)
//     } finally {
//       setLoadingActions(prev => {
//         const { [notificationId]: _, ...rest } = prev
//         return rest
//       })
//     }
//   }

//   const handleDecline = async (actionUrl: string, notificationId: string) => {
//     setLoadingActions(prev => ({ ...prev, [notificationId]: 'decline' }))
//     try {
//       const response = await Api.declineInvitation(actionUrl)
//       if (response) {
//         setNotifications(prev => prev.filter(n => n.id !== notificationId))
//       }
//     } catch (error) {
//       console.error('Erro ao rejeitar convite:', error)
//     } finally {
//       setLoadingActions(prev => {
//         const { [notificationId]: _, ...rest } = prev
//         return rest
//       })
//     }
//   }

//   const markAsRead = (notificationId: string) => {
//     setNotifications(prev => 
//       prev.map(n => 
//         n.id === notificationId ? { ...n, isRead: true } : n
//       )
//     )
//   }

//   const markAllAsRead = async () => {
//     let notificationIds = [] as string[]
//     notifications.map(n => n.isRead === false ? notificationIds.push(n.id) : null)

//     setNotifications(prev => 
//       prev.map(n => ({ ...n, isRead: true }))
//     )
    
//     const response = await Api.markNotificationAsRead(notificationIds)

//     if(response && response.data) {
//       console.log('Notificação marcada como lida com sucesso!')
//     }
//   }

//   const removeNotification = (notificationId: string) => {
//     setNotifications(prev => prev.filter(n => n.id !== notificationId))
//   }

//   const getNotificationIcon = (type: NotificationType) => {
//     switch (type) {
//       case NotificationType.INVITATION_RECEIVED:
//         return <Users size={18} className="text-blue-500" />
//       case NotificationType.APPOINTMENT_REMINDER:
//         return <Calendar size={18} className="text-green-500" />
//       default:
//         return <Bell size={18} className="text-muted-foreground" />
//     }
//   }

//   const formatTimeAgo = (date: Date) => {
//     const now = new Date()
//     const diff = now.getTime() - new Date(date).getTime()
//     const minutes = Math.floor(diff / 60000)
//     const hours = Math.floor(diff / 3600000)
//     const days = Math.floor(diff / 86400000)

//     if (minutes < 1) return 'Agora'
//     if (minutes < 60) return `${minutes}min atrás`
//     if (hours < 24) return `${hours}h atrás`
//     return `${days}d atrás`
//   }

//   const unreadCount = notifications.filter(n => !n.isRead).length

//   return (
//     <>
//       {/* Background overlay */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
//           onClick={onClose}
//         />
//       )}

//       {/* Notification Sidebar */}
//       <div
//         className={`
//           fixed top-0 right-0 h-screen w-[400px] z-[61]
//           transition-all duration-500 ease-in-out
//           bg-card/95 backdrop-blur-xl border-l border-border/20
//           ${isOpen ? "translate-x-0" : "translate-x-full"}
//         `}
//       >
//         {/* Decorative gradient overlay */}
//         <div className="absolute inset-0 bg-gradient-to-bl from-primary/3 via-accent/3 to-chart-3/3 rounded-l-3xl"></div>

//         <div className="relative z-10 h-full flex flex-col">
//           {/* Header */}
//           <div className="p-6 border-b border-border/20">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
//                   <Bell size={20} className="text-primary-foreground" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-foreground">Notificações</h2>
//                   {unreadCount > 0 && (
//                     <span className="text-xs text-muted-foreground">
//                       {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
//                     </span>
//                   )}
//                 </div>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={onClose}
//                 className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl h-10 w-10"
//               >
//                 <X size={20} />
//               </Button>
//             </div>

//             {/* Connection Status */}
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
//                 <span className={`text-xs font-medium ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
//                   {isConnected ? 'Conectado' : 'Desconectado'}
//                 </span>
//               </div>
//             </div>

//             {!isConnected && (
//               <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30 rounded-xl">
//                 <p className="text-xs text-orange-700 dark:text-orange-300 flex items-center gap-2">
//                   <Clock size={12} />
//                   Reconectando ao servidor...
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Notifications List */}
//           <div className="flex-1 overflow-y-auto p-6">
//             {notifications.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full text-center">
//                 <div className="w-16 h-16 bg-secondary/30 rounded-2xl flex items-center justify-center mb-4">
//                   <Bell size={24} className="text-muted-foreground" />
//                 </div>
//                 <h3 className="text-sm font-medium text-foreground mb-2">Nenhuma notificação</h3>
//                 <p className="text-xs text-muted-foreground max-w-[200px]">
//                   Você será notificado aqui quando houver novidades importantes
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {notifications.map((notification) => (
//                   <div
//                     key={notification.id}
//                     className={`
//                       relative p-4 rounded-xl transition-all duration-200 backdrop-blur-sm border cursor-pointer group
//                       ${!notification.isRead 
//                         ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
//                         : 'bg-secondary/30 border-border/10 hover:bg-secondary/40'
//                       }
//                     `}
//                     onClick={() => !notification.isRead && markAsRead(notification.id)}
//                   >
//                     {/* Unread indicator */}
//                     {!notification.isRead && (
//                       <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />
//                     )}

//                     <div className="flex items-start gap-3">
//                       <div className="flex-shrink-0 mt-0.5">
//                         {getNotificationIcon(notification.type)}
//                       </div>
                      
//                       <div className="flex-1 min-w-0">
//                         <h4 className={`text-sm font-medium text-foreground mb-1 ${!notification.isRead ? 'font-semibold' : ''}`}>
//                           {notification.title}
//                         </h4>
                        
//                         <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
//                           {notification.message}
//                         </p>
                        
//                         <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
//                           <span>{formatTimeAgo(notification.createdAt)}</span>
//                           {notification.expiresAt && (
//                             <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
//                               <Clock size={10} />
//                               Expira {formatTimeAgo(notification.expiresAt)}
//                             </span>
//                           )}
//                         </div>

//                         {/* Action Buttons for Invitations */}
//                         {notification.type === NotificationType.INVITATION_RECEIVED && notification.actionUrl && (
//                           <div className="flex gap-2">
//                             <Button
//                               size="sm"
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 handleAccept(notification.actionUrl!, notification.id)
//                               }}
//                               disabled={!!loadingActions[notification.id]}
//                               className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
//                             >
//                               <Check size={12} className="mr-1" />
//                               {loadingActions[notification.id] === 'accept' ? 'Aceitando...' : 'Aceitar'}
//                             </Button>
                            
//                             <Button
//                               size="sm"
//                               variant="destructive"
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 handleDecline(notification.actionUrl!, notification.id)
//                               }}
//                               disabled={!!loadingActions[notification.id]}
//                               className="h-7 px-3 text-xs"
//                             >
//                               <X size={12} className="mr-1" />
//                               {loadingActions[notification.id] === 'decline' ? 'Rejeitando...' : 'Rejeitar'}
//                             </Button>
//                           </div>
//                         )}

//                         {/* Generic Action for other types */}
//                         {notification.actionUrl && notification.type !== NotificationType.INVITATION_RECEIVED && (
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             className="h-7 px-3 text-xs"
//                             onClick={(e) => {
//                               e.stopPropagation()
//                               // Handle generic action
//                             }}
//                           >
//                             <Info size={12} className="mr-1" />
//                             Ver detalhes
//                           </Button>
//                         )}

//                         {/* Remove notification button */}
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation()
//                             removeNotification(notification.id)
//                           }}
//                           className="absolute top-2 right-6 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30"
//                         >
//                           <TrashBin2 size={12} className="text-red-500" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Footer Actions */}
//           {notifications.length > 0 && (
//             <div className="p-6 border-t border-border/20 space-y-2">
//               {unreadCount > 0 && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={markAllAsRead}
//                   className="w-full justify-center"
//                 >
//                   <CheckRead size={16} className="mr-2" />
//                   Marcar todas como lidas
//                 </Button>
//               )}
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setNotifications([])}
//                 className="w-full justify-center text-muted-foreground hover:text-red-600"
//               >
//                 <TrashBin2 size={16} className="mr-2" />
//                 Limpar todas
//               </Button>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   )
// }

// export default NotificationSidebar