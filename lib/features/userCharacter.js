exports.postUserCharacter = function (params, callback) {
	var that = this;

	async.waterfall([
		function (next) {
			that.database.saveUserCharacter(params, next);
		},
		function (dbResult, next) {
			that.getUserCharacter(dbResult.id, next);
		}
	], callback);
	// If has parrain
	// Add rubis
	// Au lieu de parrain -> maitre ?
	// Et le maitre peut donner des conseils, c'est un peu son mentor
	// that.updateUserRubis({ id: this.userId, rubis: '-2' }, next);
};

exports.putCharacter = function (hash, callback) {
	// this.socket.emit('putCharacter', { rubis: hash.rubis }); // this works too if you put exports.putCharacter.socket to false.
	callback(null, { rubis: hash.rubis });
	// Send to the user concerned
	// this.sockets.user(character.userId).emit('putCharacter', character);
};

exports.getUserCharacter = function (id, callback) {
	var that = this,
		_character;

	async.waterfall([
		function (next) {
			that.database.getUserCharacter(id, next);
		},
		function (character, next) {
			_character = character;
			that.database.getUser(_character.userId, next);
		},
		function (user, next) {
			_character.ressources.rubis = user.rubis;
			next(null, _character);
		}
	], callback);
};

// Default - optional: true
exports.sanitization = {
	postUserCharacter: {
		type: 'object',
		properties: {
			userId: sanitizationId,
			username: { type: 'string', optional: false, def: '', rules: ['trim'] },
			gender: { type: 'string', optional: false, def: 'm' },
			avatar: { type: 'array', optional: false, def: [] },
			trainningPoints: { type: 'integer', optional: false, min: 0, def: 10 },
			position: { type: 'string', optional: false, def: 'Maison' },
			attributes: {
				type: 'object',
				optional: false,
				def: {},
				properties: {
					tai: { type: 'integer', optional: false, def: 20 },
					nin: { type: 'integer', optional: false, def: 20 },
					gen: { type: 'integer', optional: false, def: 20 },
				}
			},
			specifications: {
				type: 'object',
				optional: false,
				def: {},
				properties: {
					life: { type: 'integer', optional: false, min: 0, def: 100 },
					chakra: { type: 'integer', optional: false, min: 0, def: 15 },
					// chakraMax - generated on getUserCharacter(id, callback)
					xp: { type: 'integer', optional: false, min: 0, def: 0 },
					// xpMax - generated on getUserCharacter(id, callback)
					level: { type: 'integer', optional: false, min: 1, max: 100, def: 1 }
				}
			},
			ressources: {
				type: 'object',
				optional: false,
				def: {},
				properties: {
					ryos: { type: 'integer', optional: false, def: 300 },
					// rubis - generated on getUserCharacter(id, callback)
				}
			},
			jutsus: {
				type: 'object',
				optional: false,
				def: {},
				properties: {
					tai: { type: 'array', optional: false, def: [] }, // def: [], jutsus de taijutsu
					nin: { type: 'array', optional: false, def: [] }, // def: [], jutsus de ninjutsu
					gen: { type: 'array', optional: false, def: [] }, // def: [], jutsus de genjutsu
				}
			},
			actions: {
				type: 'object',
				optional: false,
				def: {},
				properties: {
					mission: { type: 'integer', optional: false, def: 0 }, // gte: 0, lte: 10
					dateMission: { type: 'date', optional: false, def: Date }, // Date de la dernière mission afin de savoir si on remet le compteur a zéro
					combat: { type: 'integer', optional: false, def: 0 }, // gte: 0, lte: 30
					dateCombat: { type: 'date', optional: false, def: Date }
				}
			},
			busy: {
				type: ['boolean', 'object'],
				optional: false,
				def: false,
				properties: {
					type: { type: 'string', rules: ['trim', 'lower'] }, // eq: ['mission', 'travail', 'soins']
					id: sanitizationId, // si type='mission'
					nbHours: { type: 'integer', min: 1 }, // gte: 1, def: 1, lte: 10, si type='travail' ou type='soin'
					end: { type: 'date' } // gte: 0, def: 0, Timestamp de fin d'une action spécifique
				}
			}
		}
	},
	putCharacter: {
		type: 'object',
		properties: {}
	}
};

// Default - optional: false
exports.validation = {
	postUserCharacter: {
		type: 'object',
		strict: true,
		properties: {
			userId: sanitizationId,
			username: { type: 'string', minLength: 1 },
			gender: { type: 'string', eq: ['m', 'f'] },
			avatar: { type: 'array', exactLenth: 0 },
			trainningPoints: { type: 'integer', eq: 10 },
			position: { type: 'string', eq: 'Maison' },
			attributes: {
				type: 'object',
				properties: {
					tai: { type: 'integer', eq: 20 },
					nin: { type: 'integer', eq: 20 },
					gen: { type: 'integer', eq: 20 },
				}
			},
			specifications: {
				type: 'object',
				optional: false,
				def: {},
				properties: {
					life: { type: 'integer', eq: 100 },
					chakra: { type: 'integer', eq: 15 },
					// chakraMax - generated on getUserCharacter(id, callback)
					xp: { type: 'integer', eq: 0 },
					// xpMax - generated on getUserCharacter(id, callback)
					level: { type: 'integer', eq: 1 }
				}
			},
			ressources: {
				type: 'object',
				properties: {
					ryos: { type: 'integer', eq: 300 },
					// rubis - generated on getUserCharacter(id, callback)
				}
			},
			jutsus: {
				type: 'object',
				properties: {
					tai: { type: 'array', exactLenth: 0 }, // def: [], jutsus de taijutsu
					nin: { type: 'array', exactLenth: 0 }, // def: [], jutsus de ninjutsu
					gen: { type: 'array', exactLenth: 0 }, // def: [], jutsus de genjutsu
				}
			},
			actions: {
				type: 'object',
				properties: {
					mission: { type: 'integer', eq: 0 }, // gte: 0, lte: 10
					dateMission: { type: 'date' }, // Date de la dernière mission afin de savoir si on remet le compteur a zéro
					combat: { type: 'integer' }, // gte: 0, lte: 30
					dateCombat: { type: 'date' }
				}
			},
			busy: { type: 'boolean', eq: false }
		}
	},
	putCharacter: {
		type: 'object',
		properties: {
			rubis: { type: 'integer', gte: 0 }
		}
	},
	getUserCharacter: validationId,
	deleteUserCharacter: validationId
};