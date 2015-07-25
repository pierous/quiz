var models = require('../models/models.js');

// Autoload - factoriza el código si la ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find(quizId).then(function(quiz) {
		if (quiz) {
			req.quiz = quiz;
			next();
		} else {
			next(new Error('No existe quizId=' + quizId));
		}
	}).catch(function(error) {
		next(error);
	});
};

// GET /quizes
exports.index = function(req, res) {
	var search = (typeof(req.query.search) === "undefined") ? '%' : '%' + req.query.search + '%';
	search = search.replace(' ', '%');
	models.Quiz.findAll({where: ["pregunta like ?", search]}).then(function(quizes) {
		res.render('quizes/index', { quizes: quizes, errors: [] });
	}).catch(function(error) {
		next(error);
	});
};

// GET /quizes/:id
exports.show = function(req, res) {
    res.render('quizes/show', { quiz: req.quiz, errors: [] });
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
    if (comprobarRespuesta(req.query.respuesta, req.quiz.respuesta)) {
        resultado = 'Correcto';
    }

	res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: [] });
};

// GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(			// crea objeto quiz
		{pregunta: "", respuesta: "", tema:""}
	);

	res.render('quizes/new', { quiz: quiz, errors:[] });
};

// GET /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build(req.body.quiz);

	quiz.validate().then(function(err) {
		if (err) {
			res.render('quizes/new', { quiz: quiz, errors: err.errors });
		} else {
			// guarda en BD los campos pregunta y respuesta de quiz
			quiz.save({fields: ["pregunta", "respuesta", "tema"]}).then(function() {
				res.redirect('/quizes');
			});		// Redirección HTTP (URL relativa) lista de preguntas
		}
	});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
	var quiz = req.quiz;		// autoload de instancia quiz

	res.render('quizes/edit', { quiz: quiz, errors: [] });
};

// PUT /quizes/:id
exports.update = function(req, res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tema = req.body.quiz.tema;

	req.quiz.validate().then(function(err) {
		if (err) {
			res.render('quizes/new', { quiz: req.quiz, errors: err.errors });
		} else {
			console.log(req.quiz.tema);
			// guarda en BD los campos pregunta y respuesta de quiz
			req.quiz.save({fields: ["pregunta", "respuesta", "tema"]}).then(function() {
				res.redirect('/quizes');
			});		// Redirección HTTP (URL relativa) lista de preguntas
		}
	});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
	req.quiz.destroy().then(function() {
		res.redirect('/quizes');
	}).catch(function(error) {
		next(error);
	});
}



// Métodos auxiliares *****************************************************

function comprobarRespuesta(respuesta, respuestaCorrecta) {
	if (formatearCadena(respuesta) === formatearCadena(respuestaCorrecta)) {
		return true;
	} else {
		return false;
	}
}

function formatearCadena(cadena) {
	var resultado;

	// Quitamos los espacios en blanco del principio y final.
	resultado = cadena.replace(/(^\s*)|(\s*$)/g,""); 

	// Pasamos la cadena a minúsculas
	resultado = resultado.toLowerCase();

	// Quitamos los acentos
	resultado=resultado.replace('á','a');
	resultado=resultado.replace('é','e');
	resultado=resultado.replace('í','i');
	resultado=resultado.replace('ó','o');
	resultado=resultado.replace('ú','u');

	return resultado;
}
