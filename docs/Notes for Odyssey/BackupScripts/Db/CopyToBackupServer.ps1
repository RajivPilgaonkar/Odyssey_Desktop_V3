
  
Remove-Item -path '\\SERVER2008BCKUP\D\SQL_BACKUP_2014\Jadoo_2006.rar'
copy-item -path 'D:\SQL_BACKUP_2014\Jadoo_2006.rar' -destination '\\SERVER2008BCKUP\D\SQL_BACKUP_2014\'


Remove-Item -path '\\SERVER2008BCKUP\D\SQL_BACKUP_2014\Jadoo_2006.bak'
copy-item -path 'D:\SQL_BACKUP_2014\Jadoo_2006.bak' -destination '\\SERVER2008BCKUP\D\SQL_BACKUP_2014\'


