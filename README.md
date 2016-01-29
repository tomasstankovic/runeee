# ![Runeee](client/img/logo_full_blue@2x.png?raw=true "Runeee")

## Description
Runeee is my bachelor thesis, developed in the school year 2014/2015. It sports application which allows you to schedule workouts by coach training diary, diary lactate, forecast HR zones and much more. I was an analysis of the lactate tests, but these sources do not include it.

### Technology overview
The application is based on Node.js using Express.js, MongoDB, Jade templates, Stylus, Webpack and much more. For more info please check screenshots, read source code or [contact me](http://slinto.sk)🤘

## App Screenshots
![Profile screenshot](app_screenshots/5_profile.png?raw=true "Profile screenshot")

Want to see more screenshots? [Come on it!](https://github.com/slinto/runeee/blob/master/SCREENSHOTS.md)

## Credits
Developer (Bachelor thesis) / [Tomáš Stankovič](http://slinto.sk) / [@TomasStankovic](http://twitter.com/TomasStankovic)

Graphic Designer / [Tomáš Pinka](http://www.tomaspinka.com/) / [@tomaspinka](http://twitter.com/tomaspinka)

## Workflow
### Prerequisites
[Node.js](http://nodejs.org)
```
npm install -g gulp
npm install -g bower
```

### Installation
```
git clone git@github.com:slinto/runeee.git
cd runeee
npm install && bower install
```

### Recommended dev workflow
> Run server, nodemon for automatically reload node.js app, livereloading when is jade, js or css changed and run JSHint. Automatic compilation of Stylus code and automatic creating of google deps file.

```
gulp
```
Type `gulp` or `gulp server` and open localhost:8080 in your browser.

### Production build
> Compilation of Stylus code, minifying CSS code, image minifying and run Google Closure Compiler.

```
gulp build
```

### Release build
> App building, version bump, commit and push to git repository.

```
gulp release --version major|minor|patch
or
gulp release -v major|minor|patch
```

## License

[MIT](http://opensource.org/licenses/MIT) © [Tomáš Stankovič](http://slinto.sk)
