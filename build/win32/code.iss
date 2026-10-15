; Pollis: no license page (the AGPL asks nothing of users who only run Pollis; LICENSE.txt ships with the app)
#define LocalizedLanguageFile(Language = "") ""

[Setup]
AppId={#AppId}
AppName={#NameLong}
AppVerName={#NameVersion}
AppPublisher=The Pollis project
AppPublisherURL=https://pollis.org/
AppSupportURL=https://pollis.org/
AppUpdatesURL=https://github.com/saragga/pollis/releases
; Pollis: the Start menu shortcut goes straight into the Start menu, with no folder and so no Start Menu folder page
DisableProgramGroupPage=yes
OutputDir={#OutputDir}
OutputBaseFilename=VSCodeSetup
Compression=lzma
SolidCompression=yes
AppMutex={code:GetAppMutex}
SetupMutex={code:GetSetupMutex}
WizardImageFile="{#RepoDir}\resources\win32\inno-big-100.bmp,{#RepoDir}\resources\win32\inno-big-125.bmp,{#RepoDir}\resources\win32\inno-big-150.bmp,{#RepoDir}\resources\win32\inno-big-175.bmp,{#RepoDir}\resources\win32\inno-big-200.bmp,{#RepoDir}\resources\win32\inno-big-225.bmp,{#RepoDir}\resources\win32\inno-big-250.bmp"
WizardSmallImageFile="{#RepoDir}\resources\win32\inno-small-100.bmp,{#RepoDir}\resources\win32\inno-small-125.bmp,{#RepoDir}\resources\win32\inno-small-150.bmp,{#RepoDir}\resources\win32\inno-small-175.bmp,{#RepoDir}\resources\win32\inno-small-200.bmp,{#RepoDir}\resources\win32\inno-small-225.bmp,{#RepoDir}\resources\win32\inno-small-250.bmp"
SetupIconFile={#RepoDir}\resources\win32\code.ico
UninstallDisplayIcon={app}\{#ExeBasename}.exe
ChangesEnvironment=true
ChangesAssociations=true
MinVersion=10.0
SourceDir={#SourceDir}
AppVersion={#Version}
VersionInfoVersion={#RawVersion}
; Pollis: English only, so no language picker and no folder page (it installs to the default folder)
ShowLanguageDialog=no
DisableDirPage=yes
; Pollis: no Ready and no Finished page: double-click, a progress bar, and Pollis opens
DisableReadyPage=yes
DisableFinishedPage=yes
ArchitecturesAllowed={#ArchitecturesAllowed}
ArchitecturesInstallIn64BitMode={#ArchitecturesInstallIn64BitMode}
WizardStyle=modern

// We've seen an uptick on broken installations from updates which were unable
// to shutdown VS Code. We rely on the fact that the update signals
// that VS Code is ready to be shutdown, so we're good to use `force` here.
CloseApplications=force

#ifdef Sign
SignTool=esrp
#endif

#if "user" == InstallTarget
DefaultDirName={userpf}\{#DirName}
PrivilegesRequired=lowest
#else
DefaultDirName={pf}\{#DirName}
#endif

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl,{#RepoDir}\build\win32\i18n\messages.en.isl" {#LocalizedLanguageFile}

[InstallDelete]
Type: filesandordirs; Name: "{app}\{#VersionedResourcesFolder}\resources\app\out"; Check: IsNotBackgroundUpdate
Type: filesandordirs; Name: "{app}\{#VersionedResourcesFolder}\resources\app\plugins"; Check: IsNotBackgroundUpdate
Type: filesandordirs; Name: "{app}\{#VersionedResourcesFolder}\resources\app\extensions"; Check: IsNotBackgroundUpdate
Type: filesandordirs; Name: "{app}\{#VersionedResourcesFolder}\resources\app\node_modules"; Check: IsNotBackgroundUpdate
Type: filesandordirs; Name: "{app}\{#VersionedResourcesFolder}\resources\app\node_modules.asar.unpacked"; Check: IsNotBackgroundUpdate
Type: files; Name: "{app}\{#VersionedResourcesFolder}\resources\app\node_modules.asar"; Check: IsNotBackgroundUpdate
Type: files; Name: "{app}\{#VersionedResourcesFolder}\resources\app\Credits_45.0.2454.85.html"; Check: IsNotBackgroundUpdate
#ifdef ProxyExeBasename
; Clean up legacy Start Menu shortcut that used ProxyExeBasename instead of ProxyNameLong
Type: files; Name: "{autoprograms}\{#ProxyExeBasename}.lnk"
#endif

[UninstallDelete]
Type: filesandordirs; Name: "{app}\_"
Type: filesandordirs; Name: "{app}\bin"
Type: files; Name: "{app}\old_*"
Type: files; Name: "{app}\new_*"
Type: files; Name: "{app}\updating_version"

[Tasks]
; Pollis: the tasks page is the installer's only page, so users see and can untick the desktop icon and the PATH; with no Ready page its button reads Install
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 0,6.1
Name: "addtopath"; Description: "{cm:AddToPath}"; GroupDescription: "{cm:Other}"
Name: "runcode"; Description: "{cm:RunAfter,{#NameShort}}"; GroupDescription: "{cm:Other}"; Check: WizardSilent

[Dirs]
Name: "{app}"; AfterInstall: DisableAppDirInheritance

[Files]
Source: "*"; Excludes: "\CodeSignSummary*.md,\tools,\tools\*,\policies,\policies\*,\appx,\appx\*,\resources\app\product.json,\{#ExeBasename}.exe,{#ifdef ProxyExeBasename}\{#ProxyExeBasename}.exe,{#endif}\{#ExeBasename}.VisualElementsManifest.xml,\bin,\bin\*"; DestDir: "{code:GetDestDir}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#ExeBasename}.exe"; DestDir: "{code:GetDestDir}"; DestName: "{code:GetExeBasename}"; Flags: ignoreversion
Source: "{#ExeBasename}.VisualElementsManifest.xml"; DestDir: "{code:GetDestDir}"; DestName: "{code:GetVisualElementsManifest}"; Flags: ignoreversion
#ifdef ProxyExeBasename
Source: "{#ProxyExeBasename}.exe"; DestDir: "{code:GetDestDir}"; DestName: "{code:GetProxyExeBasename}"; Flags: ignoreversion
#endif
Source: "tools\*"; DestDir: "{app}\{#VersionedResourcesFolder}\tools"; Flags: ignoreversion
Source: "policies\*"; DestDir: "{code:GetDestDir}\{#VersionedResourcesFolder}\policies"; Flags: ignoreversion skipifsourcedoesntexist
Source: "bin\{#TunnelApplicationName}.exe"; DestDir: "{code:GetDestDir}\bin"; DestName: "{code:GetBinDirTunnelApplicationFilename}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "bin\{#ApplicationName}.cmd"; DestDir: "{code:GetDestDir}\bin"; DestName: "{code:GetBinDirApplicationCmdFilename}"; Flags: ignoreversion
Source: "bin\{#ApplicationName}"; DestDir: "{code:GetDestDir}\bin"; DestName: "{code:GetBinDirApplicationFilename}"; Flags: ignoreversion
Source: "{#ProductJsonPath}"; DestDir: "{code:GetDestDir}\{#VersionedResourcesFolder}\resources\app"; Flags: ignoreversion
#ifdef AppxPackageName
Source: "appx\{#AppxPackage}"; DestDir: "{code:GetDestDir}\{#VersionedResourcesFolder}\appx"; BeforeInstall: RemoveAppxPackage; Flags: ignoreversion; Check: ShouldUseWindows11ContextMenu
Source: "appx\{#AppxPackageDll}"; DestDir: "{code:GetDestDir}\{#VersionedResourcesFolder}\appx"; AfterInstall: AddAppxPackage; Flags: ignoreversion; Check: ShouldUseWindows11ContextMenu
#endif

[Icons]
Name: "{autoprograms}\{#NameLong}"; Filename: "{app}\{#ExeBasename}.exe"; AppUserModelID: "{#AppUserId}"; Check: ShouldUpdateShortcut(ExpandConstant('{autoprograms}\{#NameLong}.lnk'))
Name: "{autodesktop}\{#NameLong}"; Filename: "{app}\{#ExeBasename}.exe"; Tasks: desktopicon; AppUserModelID: "{#AppUserId}"; Check: ShouldUpdateShortcut(ExpandConstant('{autodesktop}\{#NameLong}.lnk'))
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#NameLong}"; Filename: "{app}\{#ExeBasename}.exe"; Tasks: quicklaunchicon; AppUserModelID: "{#AppUserId}"; Check: ShouldUpdateShortcut(ExpandConstant('{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#NameLong}.lnk'))
#ifdef ProxyExeBasename
Name: "{autoprograms}\{#ProxyNameLong}"; Filename: "{app}\{#ProxyExeBasename}.exe"; AppUserModelID: "{#ProxyAppUserId}"; Check: ShouldUpdateShortcut(ExpandConstant('{autoprograms}\{#ProxyNameLong}.lnk'))
Name: "{autodesktop}\{#ProxyNameLong}"; Filename: "{app}\{#ProxyExeBasename}.exe"; Tasks: desktopicon; AppUserModelID: "{#ProxyAppUserId}"; Check: ShouldUpdateShortcut(ExpandConstant('{autodesktop}\{#ProxyNameLong}.lnk'))
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#ProxyNameLong}"; Filename: "{app}\{#ProxyExeBasename}.exe"; Tasks: quicklaunchicon; AppUserModelID: "{#ProxyAppUserId}"; Check: ShouldUpdateShortcut(ExpandConstant('{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#ProxyNameLong}.lnk'))
#endif

[Run]
Filename: "{app}\{#ExeBasename}.exe"; Description: "{cm:LaunchProgram,{#NameLong}}"; Tasks: runcode; Flags: nowait postinstall; Check: ShouldRunAfterUpdate
; Pollis: no Finished page, so Pollis opens as soon as it is installed
Filename: "{app}\{#ExeBasename}.exe"; Description: "{cm:LaunchProgram,{#NameLong}}"; Flags: nowait; Check: WizardNotSilent
#ifdef ProxyExeBasename
Filename: "{app}\{#ProxyExeBasename}.exe"; Description: "{cm:LaunchProgram,{#ProxyNameLong}}"; Tasks: runcode; Flags: nowait postinstall; Check: ShouldRunProxyAfterUpdate
#endif

[Registry]
#if "user" == InstallTarget
#define SoftwareClassesRootKey "HKCU"
#else
#define SoftwareClassesRootKey "HKLM"
#endif

Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\{#RegValueName}SourceFile"; ValueType: string; ValueName: ""; ValueData: "{cm:SourceFile,{#NameLong}}"; Flags: uninsdeletekey
Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\{#RegValueName}SourceFile\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#VersionedResourcesFolder}\resources\app\resources\win32\default.ico"
Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\{#RegValueName}SourceFile\shell\open"; ValueType: string; ValueName: ""; ValueData: """{app}\{#ExeBasename}.exe"""
Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\{#RegValueName}SourceFile\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#ExeBasename}.exe"" ""%1"""

Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\Applications\{#ExeBasename}.exe"; ValueType: none; ValueName: ""; Flags: uninsdeletekey
Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\Applications\{#ExeBasename}.exe\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#VersionedResourcesFolder}\resources\app\resources\win32\default.ico"
Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\Applications\{#ExeBasename}.exe\shell\open"; ValueType: string; ValueName: "Icon"; ValueData: """{app}\{#ExeBasename}.exe"""
Root: {#SoftwareClassesRootKey}; Subkey: "Software\Classes\Applications\{#ExeBasename}.exe\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#ExeBasename}.exe"" ""%1"""

; URL Protocol handler for proxy executable
#ifdef ProxyExeBasename
#ifdef ProxyExeUrlProtocol
Root: HKCU; Subkey: "Software\Classes\{#ProxyExeUrlProtocol}"; ValueType: string; ValueName: ""; ValueData: "URL:{#ProxyExeUrlProtocol}"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\{#ProxyExeUrlProtocol}"; ValueType: string; ValueName: "URL Protocol"; ValueData: ""; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\{#ProxyExeUrlProtocol}\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#ProxyExeBasename}.exe"" --open-url -- ""%1"""; Flags: uninsdeletekey
#endif
#endif

; Environment
#if "user" == InstallTarget
#define EnvironmentRootKey "HKCU"
#define EnvironmentKey "Environment"
#define Uninstall64RootKey "HKCU64"
#define Uninstall32RootKey "HKCU32"
#else
#define EnvironmentRootKey "HKLM"
#define EnvironmentKey "System\CurrentControlSet\Control\Session Manager\Environment"
#define Uninstall64RootKey "HKLM64"
#define Uninstall32RootKey "HKLM32"
#endif

Root: {#EnvironmentRootKey}; Subkey: "{#EnvironmentKey}"; ValueType: expandsz; ValueName: "Path"; ValueData: "{code:AddToPath|{app}\bin}"; Tasks: addtopath; Check: NeedsAddToPath(ExpandConstant('{app}\bin'))

; App Paths - allows running code from Explorer address bar
Root: {#EnvironmentRootKey}; Subkey: "Software\Microsoft\Windows\CurrentVersion\App Paths\{#ApplicationName}.exe"; ValueType: string; ValueName: ""; ValueData: "{app}\{#ExeBasename}.exe"; Flags: uninsdeletekey
Root: {#EnvironmentRootKey}; Subkey: "Software\Microsoft\Windows\CurrentVersion\App Paths\{#ApplicationName}.exe"; ValueType: string; ValueName: "Path"; ValueData: "{app}"; Flags: uninsdeletekey

[Code]
function IsBackgroundUpdate(): Boolean;
begin
  Result := ExpandConstant('{param:update|false}') <> 'false';
end;

function IsNotBackgroundUpdate(): Boolean;
begin
  Result := not IsBackgroundUpdate();
end;

function IsVersionedUpdate(): Boolean;
begin
  Result := '{#VersionedResourcesFolder}' <> '';
end;

// Don't allow installing conflicting architectures
function InitializeSetup(): Boolean;
var
  RegKey: String;
  ThisArch: String;
  AltArch: String;
begin
  Result := True;

  #if "user" == InstallTarget
    if not WizardSilent() and IsAdmin() then begin
      if MsgBox('This installer installs {#NameShort} for your user account only and is not meant to be run as an Administrator. Are you sure you want to continue?', mbError, MB_OKCANCEL) = IDCANCEL then begin
        Result := False;
      end;
    end;
  #endif

  #if "user" == InstallTarget
    #if "arm64" == Arch
      #define IncompatibleArchRootKey "HKLM32"
    #else
      #define IncompatibleArchRootKey "HKLM64"
    #endif

    if Result and not WizardSilent() then begin
      RegKey := 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\' + copy('{#IncompatibleTargetAppId}', 2, 38) + '_is1';

      if RegKeyExists({#IncompatibleArchRootKey}, RegKey) then begin
        if MsgBox('{#NameShort} is already installed on this system for all users. We recommend first uninstalling that version before installing this one. Are you sure you want to continue the installation?', mbConfirmation, MB_YESNO) = IDNO then begin
          Result := False;
        end;
      end;
    end;
  #endif

end;

function WizardNotSilent(): Boolean;
begin
  Result := not WizardSilent();
end;

// Updates

function GetUpdateProgressFilePath(): String;
begin
  Result := ExpandConstant('{param:progress}');
end;

var
  LastReportedProgressPct: Integer;

procedure CurInstallProgressChanged(CurProgress, MaxProgress: Integer);
var
  ProgressFilePath: String;
  ProgressContent: String;
  CurrentPct: Integer;
begin
  if IsBackgroundUpdate() then begin
    ProgressFilePath := GetUpdateProgressFilePath();
    if ProgressFilePath <> '' then begin
      if MaxProgress > 0 then
        CurrentPct := (CurProgress * 100) div MaxProgress
      else
        CurrentPct := 0;
      if CurrentPct <> LastReportedProgressPct then begin
        LastReportedProgressPct := CurrentPct;
        ProgressContent := IntToStr(CurProgress) + ',' + IntToStr(MaxProgress);
        SaveStringToFile(ProgressFilePath, ProgressContent, False);
      end;
    end;
  end;
end;

var
	ShouldRestartTunnelService: Boolean;
#ifdef ProxyMutex
	ProxyWasRunning: Boolean;
	AppWasRunning: Boolean;
#endif

function StopTunnelOtherProcesses(): Boolean;
var
	WaitCounter: Integer;
	TaskKilled: Integer;
begin
	Log('Stopping all tunnel services (at ' + ExpandConstant('"{app}\bin\{#TunnelApplicationName}.exe"') + ')');
	ShellExec('', 'powershell.exe', '-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -Command "Get-WmiObject Win32_Process | Where-Object { $_.ExecutablePath -eq ' + ExpandConstant('''{app}\bin\{#TunnelApplicationName}.exe''') + ' } | Select @{Name=''Id''; Expression={$_.ProcessId}} | Stop-Process -Force"', '', SW_HIDE, ewWaitUntilTerminated, TaskKilled)

	WaitCounter := 10;
	while (WaitCounter > 0) and CheckForMutexes('{#TunnelMutex}') do
	begin
		Log('Tunnel process is is still running, waiting');
		Sleep(500);
		WaitCounter := WaitCounter - 1
	end;

	if CheckForMutexes('{#TunnelMutex}') then
		begin
			Log('Unable to stop tunnel processes');
			Result := False;
		end
	else
		Result := True;
end;

procedure StopTunnelServiceIfNeeded();
var
	StopServiceResultCode: Integer;
	WaitCounter: Integer;
begin
  ShouldRestartTunnelService := False;
 	if CheckForMutexes('{#TunnelServiceMutex}') then begin
		// stop the tunnel service
		Log('Stopping the tunnel service using ' + ExpandConstant('"{app}\bin\{#ApplicationName}.cmd"'));
		ShellExec('', ExpandConstant('"{app}\bin\{#ApplicationName}.cmd"'), 'tunnel service uninstall', '', SW_HIDE, ewWaitUntilTerminated, StopServiceResultCode);

		Log('Stopping the tunnel service completed with result code ' + IntToStr(StopServiceResultCode));

		WaitCounter := 10;
		while (WaitCounter > 0) and CheckForMutexes('{#TunnelServiceMutex}') do
		begin
			Log('Tunnel service is still running, waiting');
			Sleep(500);
			WaitCounter := WaitCounter - 1
		end;
		if CheckForMutexes('{#TunnelServiceMutex}') then
			Log('Unable to stop tunnel service')
		else
			ShouldRestartTunnelService := True;
	end
end;

// called before the wizard checks for running application
function PrepareToInstall(var NeedsRestart: Boolean): String;
begin
  if IsNotBackgroundUpdate() then
    StopTunnelServiceIfNeeded();

  if IsNotBackgroundUpdate() and not StopTunnelOtherProcesses() then
     Result := '{#NameShort} is still running a tunnel process. Please stop the tunnel before installing.'
  else
  	Result := '';
end;

// VS Code will create a flag file before the update starts (/update=C:\foo\bar)
// - if the file exists at this point, the user quit Code before the update finished, so don't start Code after update
// - otherwise, the user has accepted to apply the update and Code should start
function LockFileExists(): Boolean;
begin
  Result := FileExists(ExpandConstant('{param:update}'))
end;

// Check if VS Code created a session-end flag file to indicate OS is shutting down
// This prevents calling inno_updater.exe during system shutdown
function SessionEndFileExists(): Boolean;
begin
  Result := FileExists(ExpandConstant('{param:sessionend}'))
end;

function ShouldUpdateShortcut(Path: String): Boolean;
begin
  Result := not (IsBackgroundUpdate() and FileExists(Path));
end;

// Check if VS Code created a cancel file to signal that the update should be aborted
function CancelFileExists(): Boolean;
begin
  Result := FileExists(ExpandConstant('{param:cancel}'))
end;

function ShouldRunAfterUpdate(): Boolean;
begin
  if IsBackgroundUpdate() then
#ifdef ProxyMutex
    Result := (not LockFileExists()) and AppWasRunning
#else
    Result := not LockFileExists()
#endif
  else
    Result := True;
end;

#ifdef ProxyMutex
function ShouldRunProxyAfterUpdate(): Boolean;
begin
  // Relaunch the proxy app after a background update if it was
  // running when the update started (detected via its mutex).
  if IsBackgroundUpdate() then
    Result := (not LockFileExists()) and ProxyWasRunning
  else
    Result := False;
end;
#endif

function IsWindows11OrLater(): Boolean;
begin
  Result := (GetWindowsVersion >= $0A0055F0);
end;

function IsWindows10ContextMenuForced(): Boolean;
var
  SubKey: String;
begin
  // Check if the user has forced Windows 10 style context menus on Windows 11
  SubKey := 'Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32';
  Result := RegKeyExists(HKEY_CURRENT_USER, SubKey);
end;

function ShouldUseWindows11ContextMenu(): Boolean;
begin
  // Use Windows 11 context menu only if:
  // 1. Running on Windows 11 or later
  // 2. User has NOT forced Windows 10 style context menus
  Result := IsWindows11OrLater() and not IsWindows10ContextMenuForced();
end;

function BoolToStr(Value: Boolean): String;
begin
  if Value then
    Result := 'true'
  else
    Result := 'false';
end;

procedure DeleteLegacyContextMenuRegistryKeys();
begin
  RegDeleteKeyIncludingSubkeys({#EnvironmentRootKey}, 'Software\Classes\*\shell\{#RegValueName}');
  RegDeleteKeyIncludingSubkeys({#EnvironmentRootKey}, 'Software\Classes\directory\shell\{#RegValueName}');
  RegDeleteKeyIncludingSubkeys({#EnvironmentRootKey}, 'Software\Classes\directory\background\shell\{#RegValueName}');
  RegDeleteKeyIncludingSubkeys({#EnvironmentRootKey}, 'Software\Classes\Drive\shell\{#RegValueName}');
end;

function GetAppMutex(Value: string): string;
begin
  if IsBackgroundUpdate() then
    Result := ''
  else
#ifdef ProxyMutex
    Result := '{#AppMutex},{#ProxyMutex}';
#else
    Result := '{#AppMutex}';
#endif
end;

function GetSetupMutex(Value: string): string;
begin
  // Always create the base setup mutex to prevent multiple installers running.
  // During background updates, also create a -updating mutex that VS Code checks
  // to avoid launching while an update is in progress.
  if IsBackgroundUpdate() then
#ifdef ProxyMutex
    Result := '{#AppMutex}setup,{#AppMutex}-updating,{#ProxyMutex}-updating'
#else
    Result := '{#AppMutex}setup,{#AppMutex}-updating'
#endif
  else
    Result := '{#AppMutex}setup';
end;

function GetDestDir(Value: string): string;
begin
  if IsBackgroundUpdate() and not IsVersionedUpdate() then
    Result := ExpandConstant('{app}\_')
  else
    Result := ExpandConstant('{app}');
end;

function GetVisualElementsManifest(Value: string): string;
begin
  if IsBackgroundUpdate() and IsVersionedUpdate() then
    Result := ExpandConstant('new_{#ExeBasename}.VisualElementsManifest.xml')
  else
    Result := ExpandConstant('{#ExeBasename}.VisualElementsManifest.xml');
end;

function GetExeBasename(Value: string): string;
begin
  if IsBackgroundUpdate() and IsVersionedUpdate() then
    Result := ExpandConstant('new_{#ExeBasename}.exe')
  else
    Result := ExpandConstant('{#ExeBasename}.exe');
end;

#ifdef ProxyExeBasename
function GetProxyExeBasename(Value: string): string;
begin
  if IsBackgroundUpdate() and IsVersionedUpdate() then
    Result := ExpandConstant('new_{#ProxyExeBasename}.exe')
  else
    Result := ExpandConstant('{#ProxyExeBasename}.exe');
end;
#endif

function GetBinDirTunnelApplicationFilename(Value: string): string;
begin
  if IsBackgroundUpdate() and IsVersionedUpdate() then
    Result := ExpandConstant('new_{#TunnelApplicationName}.exe')
  else
    Result := ExpandConstant('{#TunnelApplicationName}.exe');
end;

function GetBinDirApplicationFilename(Value: string): string;
begin
  if IsBackgroundUpdate() and IsVersionedUpdate() then
    Result := ExpandConstant('new_{#ApplicationName}')
  else
    Result := ExpandConstant('{#ApplicationName}');
end;

function GetBinDirApplicationCmdFilename(Value: string): string;
begin
  if IsBackgroundUpdate() and IsVersionedUpdate() then
    Result := ExpandConstant('new_{#ApplicationName}.cmd')
  else
    Result := ExpandConstant('{#ApplicationName}.cmd');
end;

function QualityIsInsiders(): boolean;
begin
  if '{#Quality}' = 'insider' then
    Result := True
  else
    Result := False;
end;

#ifdef AppxPackageName
var
  AppxPackageFullname: String;

procedure ExecAndGetFirstLineLog(const S: String; const Error, FirstLine: Boolean);
begin
  if not Error and (AppxPackageFullname = '') and (Trim(S) <> '') then
    AppxPackageFullname := S;
  Log(S);
end;

function AppxPackageInstalled(const name: String; var ResultCode: Integer): Boolean;
begin
  AppxPackageFullname := '';
  ResultCode := -1;
  try
    Log('Get-AppxPackage for package with name: ' + name);
    ExecAndLogOutput('powershell.exe', '-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -Command ' + AddQuotes('Get-AppxPackage -Name ''' + name + ''' | Select-Object -ExpandProperty PackageFullName'), '', SW_HIDE, ewWaitUntilTerminated, ResultCode, @ExecAndGetFirstLineLog);
  except
    Log(GetExceptionMessage);
    ResultCode := -1;
  end;
  if (AppxPackageFullname <> '') then
    Result := True
  else
    Result := False;

  Log('Get-AppxPackage result: name=' + name + ', installed=' + BoolToStr(Result) + ', resultCode=' + IntToStr(ResultCode) + ', packageFullName=' + AppxPackageFullname);
end;

procedure AddAppxPackage();
var
  AddAppxPackageResultCode: Integer;
  IsCurrentAppxInstalled: Boolean;
begin
  if SessionEndFileExists() then begin
    Log('Skipping Add-AppxPackage because session end was detected.');
    exit;
  end;

  IsCurrentAppxInstalled := AppxPackageInstalled(ExpandConstant('{#AppxPackageName}'), AddAppxPackageResultCode);
  if not IsCurrentAppxInstalled then begin
    Log('Installing appx ' + AppxPackageFullname + ' ...');
#if "user" == InstallTarget
    ShellExec('', 'powershell.exe', '-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -Command ' + AddQuotes('Add-AppxPackage -Path ''' + ExpandConstant('{app}\{#VersionedResourcesFolder}\appx\{#AppxPackage}') + ''' -ExternalLocation ''' + ExpandConstant('{app}\{#VersionedResourcesFolder}\appx') + ''''), '', SW_HIDE, ewWaitUntilTerminated, AddAppxPackageResultCode);
#else
    ShellExec('', 'powershell.exe', '-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -Command ' + AddQuotes('Add-AppxPackage -Stage ''' + ExpandConstant('{app}\{#VersionedResourcesFolder}\appx\{#AppxPackage}') + ''' -ExternalLocation ''' + ExpandConstant('{app}\{#VersionedResourcesFolder}\appx') + '''; Add-AppxProvisionedPackage -Online -SkipLicense -PackagePath ''' + ExpandConstant('{app}\{#VersionedResourcesFolder}\appx\{#AppxPackage}') + ''''), '', SW_HIDE, ewWaitUntilTerminated, AddAppxPackageResultCode);
#endif
    Log('Add-AppxPackage complete with result code ' + IntToStr(AddAppxPackageResultCode) + '.');
  end else begin
    Log('Skipping Add-AppxPackage because package is already installed.');
  end;
end;

procedure RemoveAppxPackage();
var
  RemoveAppxPackageResultCode: Integer;
begin
  // Remove the old context menu package
  // Following condition can be removed in v1.111.
  if QualityIsInsiders() and not SessionEndFileExists() and AppxPackageInstalled('Microsoft.VSCodeInsiders', RemoveAppxPackageResultCode) then begin
    Log('Deleting old appx ' + AppxPackageFullname + ' installation...');
    ShellExec('', 'powershell.exe', '-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -Command ' + AddQuotes('Remove-AppxPackage -Package ''' + AppxPackageFullname + ''''), '', SW_HIDE, ewWaitUntilTerminated, RemoveAppxPackageResultCode);
    Log('Remove-AppxPackage for old appx completed with result code ' + IntToStr(RemoveAppxPackageResultCode) + '.');
    DeleteFile(ExpandConstant('{app}\appx\code_insiders_explorer_{#Arch}.appx'));
    DeleteFile(ExpandConstant('{app}\appx\code_insiders_explorer_command.dll'));
  end;
  if not SessionEndFileExists() and AppxPackageInstalled(ExpandConstant('{#AppxPackageName}'), RemoveAppxPackageResultCode) then begin
    Log('Removing current ' + AppxPackageFullname + ' appx installation...');
#if "user" == InstallTarget
    ShellExec('', 'powershell.exe', '-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -Command ' + AddQuotes('Remove-AppxPackage -Package ''' + AppxPackageFullname + ''''), '', SW_HIDE, ewWaitUntilTerminated, RemoveAppxPackageResultCode);
#else
    ShellExec('', 'powershell.exe', '-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -Command ' + AddQuotes('$packages = Get-AppxPackage ''' + ExpandConstant('{#AppxPackageName}') + '''; foreach ($package in $packages) { Remove-AppxProvisionedPackage -PackageName $package.PackageFullName -Online }; foreach ($package in $packages) { Remove-AppxPackage -Package $package.PackageFullName -AllUsers }'), '', SW_HIDE, ewWaitUntilTerminated, RemoveAppxPackageResultCode);
#endif
    Log('Remove-AppxPackage for current appx installation complete with result code ' + IntToStr(RemoveAppxPackageResultCode) + '.');
  end else if not SessionEndFileExists() then begin
    Log('Skipping Remove-AppxPackage for current appx because package is not installed.');
  end;
end;
#endif

procedure CurStepChanged(CurStep: TSetupStep);
var
  UpdateResultCode: Integer;
	StartServiceResultCode: Integer;
begin
  if CurStep = ssPostInstall then
  begin
#ifdef AppxPackageName
    // Remove the appx package when user has forced Windows 10 context menus via
    // registry. This handles the case where the user previously had the appx
    // installed but now wants the classic context menu style.
    if IsWindows10ContextMenuForced() then begin
      RemoveAppxPackage();
    end;
    // Remove the old context menu registry keys
    if ShouldUseWindows11ContextMenu() then begin
      DeleteLegacyContextMenuRegistryKeys();
    end;
#endif

    if IsBackgroundUpdate() then
    begin
#ifdef ProxyMutex
      // Snapshot whether each app is running before we wait for them to exit
      ProxyWasRunning := CheckForMutexes('{#ProxyMutex}');
      AppWasRunning := CheckForMutexes('{#AppMutex}');
      Log('App was running: ' + BoolToStr(AppWasRunning));
      Log('Proxy app was running: ' + BoolToStr(ProxyWasRunning));
#endif

      SaveStringToFile(ExpandConstant('{app}\updating_version'), '{#Commit}', False);
      CreateMutex('{#AppMutex}-ready');
      DeleteFile(GetUpdateProgressFilePath());

      Log('Checking whether application is still running...');
#ifdef ProxyMutex
      while (CheckForMutexes('{#AppMutex},{#ProxyMutex}')) do
#else
      while (CheckForMutexes('{#AppMutex}')) do
#endif
      begin
        if CancelFileExists() then
        begin
          Log('Cancel file detected, aborting background update.');
          DeleteFile(ExpandConstant('{app}\updating_version'));
          Abort;
        end;
        Sleep(1000)
      end;
      Log('Application appears not to be running.');

      if not SessionEndFileExists() and not CancelFileExists() then begin
        StopTunnelServiceIfNeeded();
        Log('Invoking inno_updater for background update');
        Exec(ExpandConstant('{app}\{#VersionedResourcesFolder}\tools\inno_updater.exe'), ExpandConstant('"{app}\{#ExeBasename}.exe" ' + BoolToStr(LockFileExists()) + ' "{cm:UpdatingVisualStudioCode}"' {#ifdef ProxyExeBasename} + ' "{#ProxyExeBasename}.exe"' {#endif}), '', SW_SHOW, ewWaitUntilTerminated, UpdateResultCode);
        DeleteFile(ExpandConstant('{app}\updating_version'));
        Log('inno_updater completed successfully');
        #if "system" == InstallTarget
          if IsVersionedUpdate() then begin
            Log('Invoking inno_updater to remove previous installation folder');
            Exec(ExpandConstant('{app}\{#VersionedResourcesFolder}\tools\inno_updater.exe'), ExpandConstant('"--gc" "{app}\{#ExeBasename}.exe" "{#VersionedResourcesFolder}" "{#ExeBasename}.exe"' {#ifdef ProxyExeBasename} + ' "{#ProxyExeBasename}.exe"' {#endif}), '', SW_SHOW, ewWaitUntilTerminated, UpdateResultCode);
            Log('inno_updater completed gc successfully');
          end;
        #endif
      end else begin
        Log('Skipping inno_updater.exe call because OS session is ending or cancel was requested');
      end;
    end else begin
      if IsVersionedUpdate() then begin
        Log('Invoking inno_updater to remove previous installation folder');
        Exec(ExpandConstant('{app}\{#VersionedResourcesFolder}\tools\inno_updater.exe'), ExpandConstant('"--gc" "{app}\{#ExeBasename}.exe" "{#VersionedResourcesFolder}" "{#ExeBasename}.exe"' {#ifdef ProxyExeBasename} + ' "{#ProxyExeBasename}.exe"' {#endif}), '', SW_SHOW, ewWaitUntilTerminated, UpdateResultCode);
        Log('inno_updater completed gc successfully');
      end;
    end;

    if ShouldRestartTunnelService then
    begin
      // start the tunnel service
      Log('Restarting the tunnel service...');
      ShellExec('', ExpandConstant('"{app}\bin\{#ApplicationName}.cmd"'), 'tunnel service install', '', SW_HIDE, ewWaitUntilTerminated, StartServiceResultCode);
      Log('Starting the tunnel service completed with result code ' + IntToStr(StartServiceResultCode));
      ShouldRestartTunnelService := False
    end;
  end;
end;

// https://stackoverflow.com/a/23838239/261019
procedure Explode(var Dest: TArrayOfString; Text: String; Separator: String);
var
  i, p: Integer;
begin
  i := 0;
  repeat
    SetArrayLength(Dest, i+1);
    p := Pos(Separator,Text);
    if p > 0 then begin
      Dest[i] := Copy(Text, 1, p-1);
      Text := Copy(Text, p + Length(Separator), Length(Text));
      i := i + 1;
    end else begin
      Dest[i] := Text;
      Text := '';
    end;
  until Length(Text)=0;
end;

function NeedsAddToPath(VSCode: string): boolean;
var
  OrigPath: string;
begin
  if not RegQueryStringValue({#EnvironmentRootKey}, '{#EnvironmentKey}', 'Path', OrigPath)
  then begin
    Result := True;
    exit;
  end;
  Result := Pos(';' + VSCode + ';', ';' + OrigPath + ';') = 0;
end;

function AddToPath(VSCode: string): string;
var
  OrigPath: string;
begin
  RegQueryStringValue({#EnvironmentRootKey}, '{#EnvironmentKey}', 'Path', OrigPath)

  if (Length(OrigPath) > 0) and (OrigPath[Length(OrigPath)] = ';') then
    Result := OrigPath + VSCode
  else
    Result := OrigPath + ';' + VSCode
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  Path: string;
  VSCodePath: string;
  Parts: TArrayOfString;
  NewPath: string;
  i: Integer;
begin
  if not CurUninstallStep = usUninstall then begin
    exit;
  end;

#ifdef AppxPackageName
  RemoveAppxPackage();
#endif
  if not RegQueryStringValue({#EnvironmentRootKey}, '{#EnvironmentKey}', 'Path', Path)
  then begin
    exit;
  end;
  NewPath := '';
  VSCodePath := ExpandConstant('{app}\bin')
  Explode(Parts, Path, ';');
  for i:=0 to GetArrayLength(Parts)-1 do begin
    if CompareText(Parts[i], VSCodePath) <> 0 then begin
      NewPath := NewPath + Parts[i];

      if i < GetArrayLength(Parts) - 1 then begin
        NewPath := NewPath + ';';
      end;
    end;
  end;
  RegWriteExpandStringValue({#EnvironmentRootKey}, '{#EnvironmentKey}', 'Path', NewPath);
end;

#ifdef Debug
  #expr SaveToFile(AddBackslash(SourcePath) + "code-processed.iss")
#endif

// https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/icacls
// https://docs.microsoft.com/en-US/windows/security/identity-protection/access-control/security-identifiers
procedure DisableAppDirInheritance();
var
  ResultCode: Integer;
  Permissions: string;
begin
  Permissions := '/grant:r "*S-1-5-18:(OI)(CI)F" /grant:r "*S-1-5-32-544:(OI)(CI)F" /grant:r "*S-1-5-11:(OI)(CI)RX" /grant:r "*S-1-5-32-545:(OI)(CI)RX"';

  #if "user" == InstallTarget
    Permissions := Permissions + Format(' /grant:r "*S-1-3-0:(OI)(CI)F" /grant:r "%s:(OI)(CI)F"', [GetUserNameString()]);
  #endif

  Exec(ExpandConstant('{sys}\icacls.exe'), ExpandConstant('"{app}" /inheritancelevel:r ') + Permissions, '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;
