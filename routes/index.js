exports.view = function(req, res){
   res.render('index', {alternate: false});
};

exports.secondaryView = function(req, res){
   res.render('index', {alternate: true});
};
