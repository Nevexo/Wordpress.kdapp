/* Compiled by kdc on Thu Jul 17 2014 21:40:35 GMT+0000 (UTC) */
(function() {
/* KDAPP STARTS */
/* BLOCK STARTS: /home/glang/Applications/Wordpress.kdapp/index.coffee */
var AppName, LogWatcher, OutPath, WordPressController, WordPressMainView, description, domain, existingFile, launchURL, png, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

LogWatcher = (function(_super) {
  __extends(LogWatcher, _super);

  function LogWatcher() {
    _ref = LogWatcher.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  LogWatcher.prototype.fileAdded = function(change) {
    var name, percentage, status, _ref1;
    name = change.file.name;
    _ref1 = name.split('-'), percentage = _ref1[0], status = _ref1[1];
    return this.emit("UpdateProgress", percentage, status);
  };

  return LogWatcher;

})(FSWatcher);

AppName = "WordPress";

domain = "" + (KD.nick()) + ".kd.io";

OutPath = "/tmp/_WordPressinstaller.out";

existingFile = "~/Web/wordpress/wp-config.php";

png = "https://raw.githubusercontent.com/glang/Wordpress.kdapp/master/wordpress.png";

launchURL = "http://" + domain + "/wordpress";

description = "<p><br><b>Note: A MySQL database named \"wordpress_db\" will be created for user \"root\". </b></p>\n<p><b>WordPress</b> is a free and open source blogging tool and a content management system (CMS) based on PHP and MySQL, which runs on a web hosting service. Features include a plug-in architecture and a template system. <b>WordPress</b> is used by more than 18.9% of the top 10 million websites as of August 2013. WordPress is the most popular blogging system in use on the Web, at more than 60 million websites.</p>        \n<p>You can see some <b><a href=\"http://WordPress.org/showcase/\">examples </a></b> of sites that have used WordPress among which \ninclude The New York Times Blog, TechCrunch, Flickr, and many others. If you are new to WordPress, be sure to check out the <b><a href=\"https://codex.WordPress.org/WordPress_Lessons\">WordPress Lessons</a></b>, and the <b><a href=\"https://WordPress.org/news/\">WordPress blog</a></b>.</p>\n<p><b>If your installation did not go smoothly, reinstall WordPress by clicking this button: </b><p>\n<p><b>If your installation was successful, this is what you should see when clicking the generated URL: </b></p>\n<img class=\"picture\" src=\"https://camo.githubusercontent.com/151ba1700b1201678839e8c235c7d25352359080/687474703a2f2f692e696d6775722e636f6d2f493477675075782e706e67\">\n<p><b><br><br>After filling out the basic info and logging in, you will be brought here: </b></p>\n<img class=\"picture\" src=\"http://i.imgur.com/IUgwK3S.png\">\n<p><b><br><br>Want to install a new theme or plugin? When prompted for connection information, enter this: </b></p>\n<p><b>Hostname: localhost</b></p>\n<p><b>FTP Username: Your Koding Username</b></p>\n<p><b>FTP Password: Your Koding Password</b></p>\n<img class=\"picture\" src=\"http://i.imgur.com/zg9o6lZ.png\">\n<p><b><br>That's it for the WordPress on Koding Guide! Have fun!</b></p>\n";

WordPressMainView = (function(_super) {
  __extends(WordPressMainView, _super);

  function WordPressMainView(options, data) {
    if (options == null) {
      options = {};
    }
    options.cssClass = "" + AppName + "-installer";
    WordPressMainView.__super__.constructor.call(this, options, data);
  }

  WordPressMainView.prototype.viewAppended = function() {
    var _this = this;
    return KD.singletons.appManager.require('Terminal', function() {
      _this.addSubView(_this.header = new KDHeaderView({
        title: "" + AppName + " Installer",
        type: "big"
      }));
      _this.addSubView(_this.toggle = new KDToggleButton({
        cssClass: 'toggle-button',
        style: "clean-gray",
        defaultState: "Show details",
        states: [
          {
            title: "Show details",
            callback: function(cb) {
              _this.terminal.setClass('in');
              _this.toggle.setClass('toggle');
              _this.terminal.webterm.setKeyView();
              return typeof cb === "function" ? cb() : void 0;
            }
          }, {
            title: "Hide details",
            callback: function(cb) {
              _this.terminal.unsetClass('in');
              _this.toggle.unsetClass('toggle');
              return typeof cb === "function" ? cb() : void 0;
            }
          }
        ]
      }));
      _this.addSubView(_this.logo = new KDCustomHTMLView({
        tagName: 'img',
        cssClass: 'logo',
        attributes: {
          src: png
        }
      }));
      _this.watcher = new LogWatcher;
      _this.addSubView(_this.progress = new KDProgressBarView({
        initial: 100,
        title: "Checking installation..."
      }));
      _this.addSubView(_this.terminal = new TerminalPane({
        cssClass: 'terminal'
      }));
      _this.addSubView(_this.button = new KDButtonView({
        title: "Install " + AppName,
        cssClass: 'main-button solid',
        loader: {
          color: "#FFFFFF",
          diameter: 12
        },
        callback: function() {
          return _this.installCallback();
        }
      }));
      _this.addSubView(_this.link = new KDCustomHTMLView({
        cssClass: 'hidden running-link'
      }));
      _this.link.setSession = function() {
        this.updatePartial("Click here to launch " + AppName + ": <a target='_blank' href='" + launchURL + "'>" + launchURL + "</a>");
        return this.show();
      };
      _this.addSubView(_this.content = new KDCustomHTMLView({
        cssClass: "" + AppName + "-help",
        partial: description
      }));
      _this.content.addSubView(_this.reinstallButton = new KDButtonView({
        title: "Reinstall " + AppName,
        cssClass: 'reinstall-button solid',
        loader: {
          color: "#FFFFFF",
          diameter: 12
        },
        callback: function() {
          _this.link.hide();
          _this.progress.updateBar(100, '%', "Reinstalling WordPress");
          _this.terminal.runCommand("rm /tmp/_WordPressinstaller.out -r && rm ~/Web/wordpress -r");
          return _this.installCallback();
        }
      }));
      return _this.checkState();
    });
  };

  WordPressMainView.prototype.checkState = function() {
    var vmc,
      _this = this;
    vmc = KD.getSingleton('vmController');
    this.button.showLoader();
    return FSHelper.exists(existingFile, vmc.defaultVmName, function(err, found) {
      if (err) {
        warn(err);
      }
      if (!found) {
        _this.link.hide();
        _this.progress.updateBar(100, '%', "" + AppName + " is not installed.");
        return _this.switchState('install');
      } else {
        _this.progress.updateBar(100, '%', "" + AppName + " is installed.");
        _this.link.setSession();
        return _this.switchState('run');
      }
    });
  };

  WordPressMainView.prototype.switchState = function(state) {
    var style, title,
      _this = this;
    if (state == null) {
      state = 'run';
    }
    this.watcher.off('UpdateProgress');
    switch (state) {
      case 'install':
        title = "Install " + AppName;
        style = '';
        this.button.setCallback(function() {
          return _this.installCallback();
        });
        break;
      case 'run':
        this.button.hide();
    }
    this.button.unsetClass('red green');
    this.button.setClass(style);
    this.button.setTitle(title || ("Run " + AppName));
    this.button.hideLoader();
    return this.reinstallButton.hideLoader();
  };

  WordPressMainView.prototype.stopCallback = function() {
    this._lastRequest = 'stop';
    this.button.hide();
    return this.checkState();
  };

  WordPressMainView.prototype.installCallback = function() {
    var runScriptCommand, session, tmpOutPath, vmc,
      _this = this;
    this.watcher.on('UpdateProgress', function(percentage, status) {
      _this.progress.updateBar(percentage, '%', status);
      if (percentage === "100") {
        _this.button.hideLoader();
        _this.toggle.setState('Show details');
        _this.terminal.unsetClass('in');
        _this.toggle.unsetClass('toggle');
        _this.link.setSession();
        return _this.switchState('run');
      } else if (percentage === "0") {
        _this.toggle.setState('Hide details');
        _this.terminal.setClass('in');
        _this.toggle.setClass('toggle');
        return _this.terminal.webterm.setKeyView();
      }
    });
    session = (Math.random() + 1).toString(36).substring(7);
    runScriptCommand = "bash <(curl --silent https://raw.githubusercontent.com/glang/Wordpress.kdapp/master/newInstaller.sh) " + session;
    tmpOutPath = "" + OutPath + "/" + session;
    vmc = KD.getSingleton('vmController');
    return vmc.run("rm -rf " + OutPath + "; mkdir -p " + tmpOutPath, function() {
      _this.watcher.stopWatching();
      _this.watcher.path = tmpOutPath;
      _this.watcher.watch();
      return _this.terminal.runCommand(runScriptCommand);
    });
  };

  return WordPressMainView;

})(KDView);

WordPressController = (function(_super) {
  __extends(WordPressController, _super);

  function WordPressController(options, data) {
    if (options == null) {
      options = {};
    }
    options.view = new WordPressMainView;
    options.appInfo = {
      name: "WordPress",
      type: "application"
    };
    WordPressController.__super__.constructor.call(this, options, data);
  }

  return WordPressController;

})(AppController);

(function() {
  var view;
  if (typeof appView !== "undefined" && appView !== null) {
    view = new WordPressMainView;
    return appView.addSubView(view);
  } else {
    return KD.registerAppClass(WordPressController, {
      name: "WordPress",
      routes: {
        "/:name?/WordPress": null,
        "/:name?/glang/Apps/WordPress": null
      },
      dockPath: "/glang/Apps/WordPress",
      behavior: "application"
    });
  }
})();

/* KDAPP ENDS */
}).call();