class LogWatcher extends FSWatcher

  fileAdded:(change)->
    {name} = change.file
    [percentage, status] = name.split '-'
    
    @emit "UpdateProgress", percentage, status

domain     = "#{KD.nick()}.kd.io"
OutPath    = "/tmp/_WordPressinstaller.out"
wordpressIndex    = "~/Web/wordpress/index.php"
png = "https://raw.githubusercontent.com/glang/wordpress.kdapp/master/wordpress.png"

class WordpressMainView extends KDView 

  constructor:->
    super cssClass: "WordPress-installer" 

  viewAppended:->

    KD.singletons.appManager.require 'Terminal', =>

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
          <p>This is an early version of WordPress, a free open-source blogging tool and a content
          management system based on PHP and MySQL which runs on a web hosting service. </p>
          
          <p>Why should you use WordPress?</p>
          
          <ul>
            <li>
            <strong>WordPress is Free and Open Source</strong> Unlike other "free" solutions, WordPress is completely free forever.
            </li>
            <li>
            <strong>Plugins That Give You More Power</strong> Plugins allow you to add photo galleries, sliders, shopping carts,
             forums, maps, and more great functionality.  WordPress includes a searchable, one-click install directory of plugins
             (like an App Store for WordPress). </li>
            <li>
            <strong>Intuitive User-Friendly Backend .</strong>
            </li>
            <li>
            <strong>Themes Allow You To Style Your Site .</strong>
            </li>
            <li>
            <strong>Easy to Update and Keep Secure .</strong>
            </li>
            <li>
            <strong>WordPress Sites are Simple and Accessible .</strong>
            </li>
            <li>
            <strong>Your Sites Can Grow With You.</strong> You can easily upgrade your site with new features and security. 
            New themes, plugins, and other features can be added without redoing the entire site. 
            </li>

          </ul>
          
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
        ###
        title = "Running Wordpress"
        style = ''
        @button.setCallback => @stopCallback()
        ###
    @button.unsetClass 'red green'
    @button.setClass style
    @button.setTitle title or "Run WordPress"
    @button.hideLoader()

  stopCallback:->
    @_lastRequest = 'stop'
    # @terminal.runCommand "pkill -f #{wordpressIndex} -u #{KD.nick()}"
    ###KD.utils.wait 3000, => ###
    @button.hide()
    @checkState()

  runCallback:->
    @_lastRequest = 'run'
    session = (Math.random() + 1).toString(36).substring 7
    # @terminal.runCommand "node #{kdbPath}/WordPress.js #{session} &"
    ###KD.utils.wait 1000, => ###
    @checkState()

  installCallback:->
    @watcher.on 'UpdateProgress', (percentage, status)=>
      @progress.updateBar percentage, '%', status
      if percentage is "100"
        @button.hideLoader()
        @toggle.setState 'Show details'
        @terminal.unsetClass 'in'
        @toggle.unsetClass 'toggle'
        #test
        @link.setSession "Web/wordpress/index.php"
        @switchState 'run'
        # @switchState 'run'
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
      @terminal.runCommand "curl --silent https://raw.githubusercontent.com/glang/wordpress.kdapp/master/newInstaller.sh | bash -s #{session}"

  isWordpressRunning:(callback)->
    vmc = KD.getSingleton 'vmController'
    vmc.run "pgrep -f '.koding-WordPress/WordPress.js' -l -u #{KD.nick()}", (err, res)->
      callback false
      # if err then callback false
      # else callback res.split(' ').last

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