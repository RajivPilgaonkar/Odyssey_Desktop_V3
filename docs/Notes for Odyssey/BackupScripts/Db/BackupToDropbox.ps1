  
$WinRar = 'D:\Program Files (x86)\WinRAR\RAR.exe'
$BackupFiles = '@C:\Users\Server\Desktop\BackupScripts\Db\backup.txt'

Remove-Item -path 'D:\SQL_BACKUP_2014\Jadoo_2006.rar'
&$Winrar a -u 'D:\SQL_BACKUP_2014\Jadoo_2006.rar' $BackupFiles
  
#Copy .rar to DropBox
copy-item -path 'D:\SQL_BACKUP_2014\Jadoo_2006.rar' -destination 'E:\Dropbox\db' -Force

#Copy .rar to Backup Server (SERVEROLD)
copy-item -path 'D:\SQL_BACKUP_2014\Jadoo_2006.rar' -destination '\\SERVER2008BCKUP\D\SQL_BACKUP_2014\Jadoo_2006_backup.rar' -Force

#Copy .bak to Backup Server (SERVEROLD)
copy-item -path 'D:\SQL_BACKUP_2014\Jadoo_2006.bak' -destination '\\SERVER2008BCKUP\D\SQL_BACKUP_2014\Jadoo_2006_backup.bak' -Force
