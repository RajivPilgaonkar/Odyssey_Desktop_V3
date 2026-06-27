"D:\Program Files (x86)\WinRAR\RAR.exe" a -r -u "D:\SQL_BACKUP\BO" @backup.txt 
xcopy D:\SQL_BACKUP\BO.rar "\\Server2008bkup\sql_backup\BO.rar" /y
