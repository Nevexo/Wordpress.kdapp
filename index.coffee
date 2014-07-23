class LogWatcher extends FSWatcher

  fileAdded:(change)->
    {name} = change.file
    [percentage, status] = name.split '-'
    
    @emit "UpdateProgress", percentage, status

AppName = "WordPress"
domain     = "#{KD.nick()}.kd.io"
OutPath    = "/tmp/_WordPressinstaller.out"
existingFile    = "~/Web/wordpress/wp-config.php"
png = "https://raw.githubusercontent.com/glang/Wordpress.kdapp/master/wordpress.png"
launchURL = "https://#{domain}/wordpress"
description = 
          """
          <p><br><b>Note: A MySQL database named "wordpress_db" will be created for user "root". </b></p>
          <p><b>WordPress</b> is a free and open source blogging tool and a content management system (CMS) based on PHP and MySQL, which runs on a web hosting service. Features include a plug-in architecture and a template system. WordPress is used by more than 18.9% of the top 10 million websites as of August 2013. WordPress is the most popular blogging system in use on the Web, at more than 60 million websites.</p>        
          <p>You can see some <b><a href="https://WordPress.org/showcase/">examples </a></b> of sites that have used WordPress among which 
          include The New York Times Blog, TechCrunch, Flickr, and many others. If you are new to WordPress, be sure to check out the <b><a href="https://codex.WordPress.org/WordPress_Lessons">WordPress Lessons</a></b>, and the <b><a href="https://WordPress.org/news/">WordPress blog</a></b>.</p>
          <p><b><br>If your installation was successful, this is what you should see when clicking the generated URL: </b></p>
          <img class="picture" src="https://camo.githubusercontent.com/151ba1700b1201678839e8c235c7d25352359080/687474703a2f2f692e696d6775722e636f6d2f493477675075782e706e67">
          <p><b><br><br>After filling out the basic info and logging in, you will be brought here: </b></p>
          <img class="picture" src="https://i.imgur.com/IUgwK3S.png">
          <p><b><br><br>Want to install a new theme or plugin? When prompted for connection information, enter this: </b></p>
          <p><b>Hostname: localhost</b></p>
          <p><b>FTP Username: Your Koding Username</b></p>
          <p><b>FTP Password: Your Koding Password</b></p>
          <img class="picture" src="https://i.imgur.com/zg9o6lZ.png">
          <p><b><br><br>And here is a preview on the freshly installed theme: </b></p>
          <img class="picture" src="https://i.imgur.com/qycJmsH.png">
          <p><b><br>That's it for the WordPress on Koding Guide! Have fun!</b></p>
          
          """
vmc = KD.getSingleton 'vmController'          

class WordPressMainView extends KDView
  constructor:(options = {}, data)->
    options.cssClass = "#{AppName}-installer"
    super options, data

  viewAppended:-> 
  
    KD.singletons.appManager.require 'Terminal', => 
      @addSubView new TerminalPane
        cssClass: 'hidden'   
    
      @addSubView @header = new KDHeaderView
        title         : "#{AppName} Installer"
        type          : "big"

      @addSubView @logo = new KDCustomHTMLView
        tagName       : 'img'
        cssClass      : 'logo'
        attributes    :
          src         : png

      @watcher = new LogWatcher

      @addSubView @progress = new KDProgressBarView
        initial       : 100
        title         : "Checking VM State..."

      @addSubView @terminalPlaceholder = new KDView
        cssClass      : 'terminal'

      @addSubView @link = new KDCustomHTMLView
        cssClass : 'hidden running-link'
        
      @link.setSession = ->
        @updatePartial "Click here to launch #{AppName}: <a target='_blank' href='#{launchURL}'>#{launchURL}</a>"
        @show()        
        
      @addSubView @button = new KDButtonView
        title         : "Install #{AppName}"
        cssClass      : 'main-button solid'
        loader        :
          color       : "#FFFFFF"
          diameter    : 12
        callback      : => @installCallback() 
        
      @addSubView @reinstallButton = new KDButtonView
        title         : "Reinstall #{AppName}"
        cssClass      : 'reinstall-button solid'
        loader        :
          color       : "#FFFFFF"
          diameter    : 12
        callback      : => 
          @link.hide()
          @progress.updateBar 100, '%', "Reinstalling WordPress"
          @terminal.runCommand "rm ~/Web/wordpress -r"
          @installCallback()
          
      @addSubView @removeButton = new KDButtonView
        title         : "Remove #{AppName}"
        cssClass      : 'remove-button solid'
        loader        :
          color       : "#FFFFFF"
          diameter    : 12
        callback      : => 
          @link.hide()
          @progress.updateBar 100, '%', "Removing WordPress"
          @terminal.runCommand "rm ~/Web/wordpress -r"
          KD.utils.wait 2000, =>
            @checkState()
            @removeButton.hideLoader()
            @button.show()

      @addSubView @content = new KDCustomHTMLView
        cssClass : "#{AppName}-help"
        partial  : description

      @vmState() 

  vmState:->
    @button.showLoader()
    @reinstallButton.hide()
    @removeButton.hide()
    
    vmc.run "echo 'on'", (err, res) =>
      if (res.stdout.trim() is "on")
        @terminalPlaceholder.addSubView @terminal = new TerminalPane
          cssClass : "terminal"         
        @updateTerminal()
      else
        @progress.updateBar 100, '%', "Turning on VM..."
        KD.utils.wait 1000, => 
          @turnOnVM()

  turnOnVM:=>
    repeat = KD.utils.repeat 1000, =>
      vmc.run "echo 'turn on'", (err, res) =>
        if (res.stdout.trim() is "turn on")
          KD.utils.killRepeat repeat          
          @updateTerminal()
          
        console.log("stdout: #{res.stdout} stderr: #{res.stderr}")       

  updateTerminal:=>
    @terminalPlaceholder.addSubView @terminal = new TerminalPane
      cssClass : "terminal" 
    
    @addSubView @toggle = new KDToggleButton
      cssClass        : 'toggle-button'
      style           : "clean-gray" 
      defaultState    : "Show details"
      states          : [
        title         : "Show details"
        callback      : (cb)=>
          @terminalPlaceholder.setClass 'in'
          @terminal.setClass 'in'
          @toggle.setClass 'toggle'
          @terminal.webterm.setKeyView()
          cb?()
      ,
        title         : "Hide details"
        callback      : (cb)=>
          @terminalPlaceholder.unsetClass 'in'
          @terminal.unsetClass 'in'
          @toggle.unsetClass 'toggle'
          cb?()
      ]
      
    @checkState()

  checkState:->
    FSHelper.exists existingFile, vmc.defaultVmName, (err, found)=>
      warn err if err
      
      unless found
        @link.hide()
        @removeButton.hide()
        @reinstallButton.hide()
        @button.setClass 'notCentered'
        @progress.updateBar 100, '%', "#{AppName} is not installed."
        @switchState 'install'
      else
        @progress.updateBar 100, '%', "#{AppName} is installed."
        @link.setSession()
        @switchState 'run'        
  
  switchState:(state = 'run')->

    @watcher.off 'UpdateProgress'

    switch state
      when 'install'
        title = "Install #{AppName}"
        style = ''
        @button.setCallback => @installCallback()
      when 'run'
        @button.hide()
        @reinstallButton.show()
        @removeButton.show()
        @reinstallButton.hideLoader()

    @button.unsetClass 'red green'
    @button.setClass style
    @button.setTitle title or "Run #{AppName}"
    @button.hideLoader()
    

  stopCallback:->
    @_lastRequest = 'stop'
    @button.hide()
    @checkState()

  installCallback:->
    @watcher.on 'UpdateProgress', (percentage, status)=>
      @progress.updateBar percentage, '%', status
      if percentage is "100"
        @button.hideLoader()
        @toggle.setState 'Show details'
        @terminal.unsetClass 'in'
        @terminalPlaceholder.unsetClass 'in'
        @toggle.unsetClass 'toggle'
        @link.setSession()
        @switchState 'run'
        
      else if percentage is "0"
        @toggle.setState 'Hide details'
        @terminal.setClass 'in'
        @terminalPlaceholder.setClass 'in'
        @toggle.setClass 'toggle'
        @terminal.webterm.setKeyView()

    session = (Math.random() + 1).toString(36).substring 7
    runScriptCommand = "bash <(curl --silent https://raw.githubusercontent.com/glang/Wordpress.kdapp/master/newInstaller.sh) #{session}"        
    tmpOutPath = "#{OutPath}/#{session}"
    vmc.run "rm -rf #{OutPath}; mkdir -p #{tmpOutPath}", =>
      @watcher.stopWatching()
      @watcher.path = tmpOutPath
      @watcher.watch()
      @terminal.runCommand runScriptCommand



class WordPressController extends AppController

  constructor:(options = {}, data)->
    options.view    = new WordPressMainView
    options.appInfo =
      name : "Wordpress"
      type : "application"

    super options, data

do ->

  # In live mode you can add your App view to window's appView
  if appView?

    view = new WordPressMainView
    appView.addSubView view

  else

    KD.registerAppClass WordPressController,
      name     : "Wordpress"
      routes   :
        "/:name?/Wordpress" : null
        "/:name?/glang/Apps/Wordpress" : null
      dockPath : "/glang/Apps/Wordpress"
      behavior : "application"