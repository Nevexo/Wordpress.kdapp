class LogWatcher extends FSWatcher

  fileAdded:(change)->
    {name} = change.file
    [percentage, status] = name.split '-'
    
    @emit "UpdateProgress", percentage, status

domain     = "#{KD.nick()}.kd.io"
OutPath    = "/tmp/_WordPressinstaller.out"
wordpressIndex    = "~/Web/wordpress/wp-config.php"
png = "https://raw.githubusercontent.com/glang/wordpress.kdapp/master/wordpress.png"

class WordpressMainView extends KDView 

  constructor:->
    super cssClass: "WordPress-installer" 

  viewAppended:->

    KD.singletons.appManager.require 'Terminal', =>
    
      new KDNotificationView 
        title     : "Please turn on your VM in the Terminal app prior to using this app"
        type      : 'tray'
        duration  : 15000
        cssClass  : "yellow"

      @addSubView @header = new KDHeaderView
        title         : "WordPress Installer"
        type          : "big"

      @addSubView @toggle = new KDToggleButton
        cssClass        : 'toggle-button'
        style           : "clean-gray" 
        defaultState    : "Show details"
        states          : [
          title         : "Show details"
          callback      : (cb)=>
            @terminal.setClass 'in'
            @toggle.setClass 'toggle'
            @terminal.webterm.setKeyView()
            cb?()
        ,
          title         : "Hide details"
          callback      : (cb)=>
            @terminal.unsetClass 'in'
            @toggle.unsetClass 'toggle'
            cb?()
        ]

      @addSubView @logo = new KDCustomHTMLView
        tagName       : 'img'
        cssClass      : 'logo'
        attributes    :
          src         : png

      @watcher = new LogWatcher

      @addSubView @progress = new KDProgressBarView
        initial       : 100
        title         : "Checking installation..."

      @addSubView @terminal = new TerminalPane
        cssClass      : 'terminal'

      @addSubView @button = new KDButtonView
        title         : "Install WordPress"
        cssClass      : 'main-button solid'
        loader        :
          color       : "#FFFFFF"
          diameter    : 12
        callback      : => @installCallback()

      @addSubView @link = new KDCustomHTMLView
        cssClass : 'hidden running-link'
        
      @link.setSession = (session)->
        @updatePartial "Click here to launch WordPress: <a target='_blank' href='http://#{domain}/wordpress/index.php'>http://#{domain}/wordpress/index.php</a>"
        @show()

      @addSubView @content = new KDCustomHTMLView
        cssClass : "WordPress-help"
        partial  : """   
          <p><br>WordPress is a free and open source blogging tool and a content management system (CMS) based on PHP and MySQL, which runs on a web hosting service. Features include a plug-in architecture and a template system. WordPress is used by more than 18.9% of the top 10 million websites as of August 2013. WordPress is the most popular blogging system in use on the Web, at more than 60 million websites.</p>
          
          <p>You can see some <a href="http://wordpress.org/showcase/">examples </a> of sites that have used WordPress among which 
          include The New York Times Blog, TechCrunch, Flickr, and many others.  <a href="https://codex.wordpress.org/WordPress_Lessons">online tutorials</a>,
           and news on the <a href="https://wordpress.org/news/">WordPress blog</a>.</p>
           
          
        """

      @checkState()

  checkState:->

    vmc = KD.getSingleton 'vmController'

    @button.showLoader()

    FSHelper.exists wordpressIndex, vmc.defaultVmName, (err, WordPress)=>
      warn err if err
      
      unless WordPress
        @link.hide()
        @progress.updateBar 100, '%', "WordPress is not installed."
        @switchState 'install'
      else
        @progress.updateBar 100, '%', "WordPress is installed."
        @link.setSession "Web/wordpress/index.php"
        @switchState 'run'

  
  switchState:(state = 'run')->

    @watcher.off 'UpdateProgress'

    switch state
      when 'install'
        title = "Install WordPress"
        style = ''
        @button.setCallback => @installCallback()
      when 'run'
        @button.hide()

    @button.unsetClass 'red green'
    @button.setClass style
    @button.setTitle title or "Run WordPress"
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
        @toggle.unsetClass 'toggle'
        @link.setSession "Web/wordpress/index.php"
        @switchState 'run'
        
      else if percentage is "0"
        @toggle.setState 'Hide details'
        @terminal.setClass 'in'
        @toggle.setClass 'toggle'
        @terminal.webterm.setKeyView()

    session = (Math.random() + 1).toString(36).substring 7
    tmpOutPath = "#{OutPath}/#{session}"
    vmc = KD.getSingleton 'vmController'
    vmc.run "rm -rf #{OutPath}; mkdir -p #{tmpOutPath}", =>
      @watcher.stopWatching()
      @watcher.path = tmpOutPath
      @watcher.watch()
      @terminal.runCommand "bash <(curl --silent https://raw.githubusercontent.com/glang/Wordpress.kdapp/master/newInstaller.sh) #{session}"
      
class WordpressController extends AppController

  constructor:(options = {}, data)->
    options.view    = new WordpressMainView
    options.appInfo =
      name : "Wordpress"
      type : "application"

    super options, data

do ->

  # In live mode you can add your App view to window's appView
  if appView?

    view = new WordpressMainView
    appView.addSubView view

  else

    KD.registerAppClass WordpressController,
      name     : "Wordpress"
      routes   :
        "/:name?/Wordpress" : null
        "/:name?/glang/Apps/Wordpress" : null
      dockPath : "/glang/Apps/Wordpress"
      behavior : "application"
