/* Compiled by kdc on Mon Jul 28 2014 21:45:11 GMT+0000 (UTC) */
(function() {
/* KDAPP STARTS */
/* BLOCK STARTS: /home/glang/Applications/Wordpress.kdapp/index.coffee */
var AppName, LogWatcher, OutPath, WordPressController, WordPressMainView, description, domain, existingFile, installScript, launchURL, png, removeCommand, vmc, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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

launchURL = "https://" + domain + "/wordpress";

installScript = "https://raw.githubusercontent.com/glang/Wordpress.kdapp/master/newInstaller.sh";

removeCommand = "rm ~/Web/wordpress -r";

description = "<p><br><b>Note: A MySQL database named \"wordpress_db\" will be created for user \"root\". </b></p>\n<p><b>WordPress</b> is a free and open source blogging tool and a content management system (CMS) based on PHP and MySQL, which runs on a web hosting service. Features include a plug-in architecture and a template system. WordPress is used by more than 18.9% of the top 10 million websites as of August 2013. WordPress is the most popular blogging system in use on the Web, at more than 60 million websites.</p>        \n<p>You can see some <b><a href=\"http://WordPress.org/showcase/\">examples </a></b> of sites that have used WordPress among which \ninclude The New York Times Blog, TechCrunch, Flickr, and many others. If you are new to WordPress, be sure to check out the <b><a href=\"https://codex.WordPress.org/WordPress_Lessons\">WordPress Lessons</a></b>, and the <b><a href=\"https://WordPress.org/news/\">WordPress blog</a></b>.</p>\n<hr>\n<p><b><br>Once the setup is complete, click on the presented link to finish configuring your WordPress installation: </b></p>\n<img class=\"picture\" src=\"https://camo.githubusercontent.com/151ba1700b1201678839e8c235c7d25352359080/687474703a2f2f692e696d6775722e636f6d2f493477675075782e706e67\">\n<hr>\n<p><b><br><br>After filling out the basic info and logging in, you will be brought here: </b></p>\n<img class=\"picture\" src=\"http://i.imgur.com/IUgwK3S.png\">\n<hr>\n<p><b><br><br>Want to install a new theme or plugin? When prompted for connection information, enter this: </b></p>\n<p><b>Hostname: localhost</b></p>\n<p><b>FTP Username: Your Koding Username</b></p>\n<p><b>FTP Password: Your Koding Password</b></p>\n<img class=\"picture\" src=\"http://i.imgur.com/zg9o6lZ.png\">\n<hr>\n<p><b><br><br>And here is a preview on the freshly installed theme: </b></p>\n<img class=\"picture\" src=\"http://i.imgur.com/qycJmsH.png\">\n<hr>\n<p><b><br>That's it for the WordPress on Koding Guide! Have fun!</b></p>\n";

vmc = KD.getSingleton('vmController');

WordPressMainView = (function(_super) {
  __extends(WordPressMainView, _super);

  function WordPressMainView(options, data) {
    if (options == null) {
      options = {};
    }
    this.updateTerminal = __bind(this.updateTerminal, this);
    this.turnOnVM = __bind(this.turnOnVM, this);
    options.cssClass = "" + AppName + "-installer";
    WordPressMainView.__super__.constructor.call(this, options, data);
  }

  WordPressMainView.prototype.viewAppended = function() {
    var _this = this;
    return KD.singletons.appManager.require('Terminal', function() {
      _this.addSubView(new TerminalPane({
        cssClass: 'hidden'
      }));
      _this.addSubView(_this.header = new KDHeaderView({
        title: "" + AppName + " Installer",
        type: "big"
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
        title: "Checking VM State..."
      }));
      _this.addSubView(_this.terminalPlaceholder = new KDView({
        cssClass: 'terminal'
      }));
      _this.addSubView(_this.link = new KDCustomHTMLView({
        cssClass: 'hidden running-link'
      }));
      _this.link.setSession = function() {
        this.updatePartial("Click here to launch " + AppName + ": <a target='_blank' href='" + launchURL + "'>" + launchURL + "</a>");
        return this.show();
      };
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
      _this.addSubView(_this.reinstallButton = new KDButtonView({
        title: "Reinstall " + AppName,
        cssClass: 'reinstall-button solid',
        loader: {
          color: "#FFFFFF",
          diameter: 12
        },
        callback: function() {
          _this.link.hide();
          _this.progress.updateBar(100, '%', "Reinstalling " + AppName);
          _this.terminal.runCommand(removeCommand);
          return _this.installCallback();
        }
      }));
      _this.addSubView(_this.removeButton = new KDButtonView({
        title: "Remove " + AppName,
        cssClass: 'remove-button solid',
        loader: {
          color: "#FFFFFF",
          diameter: 12
        },
        callback: function() {
          _this.link.hide();
          _this.progress.updateBar(100, '%', "Removing " + AppName);
          _this.terminal.runCommand(removeCommand);
          return KD.utils.wait(2000, function() {
            _this.checkState();
            _this.removeButton.hideLoader();
            return _this.button.show();
          });
        }
      }));
      _this.addSubView(_this.content = new KDCustomHTMLView({
        cssClass: "" + AppName + "-help",
        partial: description
      }));
      return _this.vmState();
    });
  };

  WordPressMainView.prototype.vmState = function() {
    var _this = this;
    this.button.showLoader();
    this.reinstallButton.hide();
    this.removeButton.hide();
    return vmc.run("echo 'on'", function(err, res) {
      if (res.stdout.trim() === "on") {
        return _this.updateTerminal();
      } else {
        _this.progress.updateBar(100, '%', "Turning on VM...");
        return _this.turnOnVM();
      }
    });
  };

  WordPressMainView.prototype.turnOnVM = function() {
    var repeat,
      _this = this;
    return repeat = KD.utils.repeat(1000, function() {
      return vmc.run("echo 'turn on'", function(err, res) {
        if (res.stdout.trim() === "turn on") {
          KD.utils.killRepeat(repeat);
          KD.utils.wait(5000, function() {
            return _this.updateTerminal();
          });
        }
        return console.log("stdout: " + res.stdout + " stderr: " + res.stderr);
      });
    });
  };

  WordPressMainView.prototype.updateTerminal = function() {
    var _this = this;
    this.terminalPlaceholder.addSubView(this.terminal = new TerminalPane({
      cssClass: "terminal"
    }));
    this.addSubView(this.toggle = new KDToggleButton({
      cssClass: 'toggle-button',
      style: "clean-gray",
      defaultState: "Show details",
      states: [
        {
          title: "Show details",
          callback: function(cb) {
            _this.terminalPlaceholder.setClass('in');
            _this.terminal.setClass('in');
            _this.toggle.setClass('toggle');
            _this.terminal.webterm.setKeyView();
            return typeof cb === "function" ? cb() : void 0;
          }
        }, {
          title: "Hide details",
          callback: function(cb) {
            _this.terminalPlaceholder.unsetClass('in');
            _this.terminal.unsetClass('in');
            _this.toggle.unsetClass('toggle');
            return typeof cb === "function" ? cb() : void 0;
          }
        }
      ]
    }));
    return this.checkState();
  };

  WordPressMainView.prototype.checkState = function() {
    var _this = this;
    return FSHelper.exists(existingFile, vmc.defaultVmName, function(err, found) {
      if (err) {
        warn(err);
      }
      if (!found) {
        _this.link.hide();
        _this.removeButton.hide();
        _this.reinstallButton.hide();
        _this.button.setClass('notCentered');
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
        this.reinstallButton.show();
        this.removeButton.show();
        this.reinstallButton.hideLoader();
    }
    this.button.unsetClass('red green');
    this.button.setClass(style);
    this.button.setTitle(title || ("Run " + AppName));
    return this.button.hideLoader();
  };

  WordPressMainView.prototype.stopCallback = function() {
    this._lastRequest = 'stop';
    this.button.hide();
    return this.checkState();
  };

  WordPressMainView.prototype.installCallback = function() {
    var session, tmpOutPath,
      _this = this;
    this.watcher.on('UpdateProgress', function(percentage, status) {
      _this.progress.updateBar(percentage, '%', status);
      if (percentage === "100") {
        _this.button.hideLoader();
        _this.toggle.setState('Show details');
        _this.terminal.unsetClass('in');
        _this.terminalPlaceholder.unsetClass('in');
        _this.toggle.unsetClass('toggle');
        _this.link.setSession();
        return _this.switchState('run');
      } else if (percentage === "0") {
        _this.toggle.setState('Hide details');
        _this.terminal.setClass('in');
        _this.terminalPlaceholder.setClass('in');
        _this.toggle.setClass('toggle');
        return _this.terminal.webterm.setKeyView();
      }
    });
    session = (Math.random() + 1).toString(36).substring(7);
    tmpOutPath = "" + OutPath + "/" + session;
    return vmc.run("rm -rf " + OutPath + "; mkdir -p " + tmpOutPath, function() {
      _this.watcher.stopWatching();
      _this.watcher.path = tmpOutPath;
      _this.watcher.watch();
      return _this.terminal.runCommand("bash <(curl --silent " + installScript + ") " + session);
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
      name: "Wordpress",
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
      name: "Wordpress",
      routes: {
        "/:name?/Wordpress": null,
        "/:name?/glang/Apps/Wordpress": null
      },
      dockPath: "/glang/Apps/Wordpress",
      behavior: "application"
    });
  }
})();

/* KDAPP ENDS */
}).call();