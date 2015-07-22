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
	models.Quiz.findAll().then(function(quizes) {
		res.render('quizes/index', { quizes: quizes });
	}).catch(function(error) {
		next(error);
	});
};

// GET /quizes/:id
exports.show = function(req, res) {
    res.render('quizes/show', {quiz: req.quiz});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
    if (comprobarRespuesta(req.query.respuesta, req.quiz.respuesta)) {
        resultado = 'Correcto';
    }

	res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado});
};

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
