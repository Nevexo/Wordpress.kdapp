/* Compiled by kdc on Sun Apr 20 2014 06:24:04 GMT+0000 (UTC) */
(function() {
/* KDAPP STARTS */
/* BLOCK STARTS: /home/glang/Applications/Wordpress.kdapp/index.coffee */
var LogWatcher, OutPath, WordpressController, WordpressMainView, domain, png, wordpressIndex, _ref,
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

domain = "" + (KD.nick()) + ".kd.io";

OutPath = "/tmp/_WordPressinstaller.out";

wordpressIndex = "~/Web/wordpress/index.php";

png = "https://raw.githubusercontent.com/glang/wordpress.kdapp/master/wordpress.png";

WordpressMainView = (function(_super) {
  __extends(WordpressMainView, _super);

  function WordpressMainView() {
    WordpressMainView.__super__.constructor.call(this, {
      cssClass: "WordPress-installer"
    });
  }

  WordpressMainView.prototype.viewAppended = function() {
    var _this = this;
    return KD.singletons.appManager.require('Terminal', function() {
      _this.addSubView(_this.header = new KDHeaderView({
        title: "WordPress Installer",
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
        title: "Install WordPress",
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
      _this.link.setSession = function(session) {
        this.updatePartial("Click here to launch WordPress: <a target='_blank' href='http://" + domain + "/wordpress/index.php'>http://" + domain + "/wordpress/index.php</a>");
        return this.show();
      };
      _this.addSubView(_this.content = new KDCustomHTMLView({
        cssClass: "WordPress-help",
        partial: "   \n<p><br>WordPress is a free and open source blogging tool and a content management system (CMS) based on PHP and MySQL, which runs on a web hosting service. Features include a plug-in architecture and a template system. WordPress is used by more than 18.9% of the top 10 million websites as of August 2013. WordPress is the most popular blogging system in use on the Web, at more than 60 million websites.</p>\n\n<p>You can see some <a href=\"http://wordpress.org/showcase/\">examples </a> of sites that have used WordPress among which \ninclude The New York Times Blog, TechCrunch, Flickr, and many others.  <a href=\"https://codex.wordpress.org/WordPress_Lessons\">online tutorials</a>,\n and news on the <a href=\"https://wordpress.org/news/\">WordPress blog</a>.</p>\n \n"
      }));
      return _this.checkState();
    });
  };

  WordpressMainView.prototype.checkState = function() {
    var vmc,
      _this = this;
    vmc = KD.getSingleton('vmController');
    this.button.showLoader();
    return FSHelper.exists(wordpressIndex, vmc.defaultVmName, function(err, WordPress) {
      if (err) {
        warn(err);
      }
      if (!WordPress) {
        _this.link.hide();
        _this.progress.updateBar(100, '%', "WordPress is not installed.");
        return _this.switchState('install');
      } else {
        _this.progress.updateBar(100, '%', "WordPress is installed.");
        _this.link.setSession("Web/wordpress/index.php");
        return _this.switchState('run');
      }
    });
  };

  WordpressMainView.prototype.switchState = function(state) {
    var style, title,
      _this = this;
    if (state == null) {
      state = 'run';
    }
    this.watcher.off('UpdateProgress');
    switch (state) {
      case 'install':
        title = "Install WordPress";
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
    this.button.setTitle(title || "Run WordPress");
    return this.button.hideLoader();
  };

  WordpressMainView.prototype.stopCallback = function() {
    this._lastRequest = 'stop';
    this.button.hide();
    return this.checkState();
  };

  WordpressMainView.prototype.installCallback = function() {
    var session, tmpOutPath, vmc,
      _this = this;
    this.watcher.on('UpdateProgress', function(percentage, status) {
      _this.progress.updateBar(percentage, '%', status);
      if (percentage === "100") {
        _this.button.hideLoader();
        _this.toggle.setState('Show details');
        _this.terminal.unsetClass('in');
        _this.toggle.unsetClass('toggle');
        _this.link.setSession("Web/wordpress/index.php");
        return _this.switchState('run');
      } else if (percentage === "0") {
        _this.toggle.setState('Hide details');
        _this.terminal.setClass('in');
        _this.toggle.setClass('toggle');
        return _this.terminal.webterm.setKeyView();
      }
    });
    session = (Math.random() + 1).toString(36).substring(7);
    tmpOutPath = "" + OutPath + "/" + session;
    vmc = KD.getSingleton('vmController');
    return vmc.run("rm -rf " + OutPath + "; mkdir -p " + tmpOutPath, function() {
      _this.watcher.stopWatching();
      _this.watcher.path = tmpOutPath;
      _this.watcher.watch();
      return _this.terminal.runCommand("curl --silent https://raw.githubusercontent.com/glang/Wordpress.kdapp/master/newInstaller.sh | bash -s " + session);
    });
  };

  return WordpressMainView;

})(KDView);

WordpressController = (function(_super) {
  __extends(WordpressController, _super);

  function WordpressController(options, data) {
    if (options == null) {
      options = {};
    }
    options.view = new WordpressMainView;
    options.appInfo = {
      name: "Wordpress",
      type: "application"
    };
    WordpressController.__super__.constructor.call(this, options, data);
  }

  return WordpressController;

})(AppController);

(function() {
  var view;
  if (typeof appView !== "undefined" && appView !== null) {
    view = new WordpressMainView;
    return appView.addSubView(view);
  } else {
    return KD.registerAppClass(WordpressController, {
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