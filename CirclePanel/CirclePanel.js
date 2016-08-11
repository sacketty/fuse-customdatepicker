var Observable = require("FuseJS/Observable");

var bigCircle = 224;
var radius = [90, 60];

var centuriesLbl = "centuries";
var centuriesFactor = 50 

var transparent = [0, 0, 200, 0];  //transparent
var digitFill = [151,59,77,0.5];
var centerFill =[parseInt("ff",16), 0, 0, 1];
var lineOpacity = 0.2;

var selector = Observable("centuries");

var digits = selector.map(makeDigits).inner();

var wheelDigitsView = digits.map(function(item, index){
	return {
		item: item,
		index: index
	}
});

//var dateValue = Observable(new DateObject(this.DateTime.value));
var dateTime = this.DateTime;
var pickerLabel = this.InputLabel;
var dateValue = dateTime.inner().map(function(x){
	return new DateObject(x);
});

var dateElement = dateValue.map(function(x){
	digits.forEach(fillSelected);
});

var selectorReact = selector.map(function(){
	digits.forEach(fillSelected);
});

function DateObject(dte){
	var dt = dte || {years: 1970, month: 1, day: 1}; //just in case dte might be null
	this.fullYear = dt.year;
	this.ref = {
		years: dt.year % 100,
		centuries: Math.floor(dt.year/50)*50,
		months: stringify(dt.month),
		days: stringify(dt.day)
	};
	this.setValue = function(val){
		this.ref[selector.value] = val;
		this.fullYear = parseInt(this.ref.centuries)+ (parseInt(this.ref.years) % centuriesFactor)
		return this;
	};
	this.toYMD = function(){
		return {
			year: parseInt(this.ref.centuries)+ (parseInt(this.ref.years) % centuriesFactor),
			month: parseInt(this.ref.months),
			day: parseInt(this.ref.days)
		}
	}
}

function Params(to, step, offset, factor){
	this.to = to;
	this.step = step;
	this.offset = offset;
	this.factor = factor;
	this.update = function(val){
		this.offset = 0;
		if ( (val % (2 * centuriesFactor)) > 0){
			this.offset = centuriesFactor;
		}
	}
}

var selectorParams = {
	months: [new Params(12,1,1,1)],
	days: [new Params(20, 1, 1, 1), new Params(11, 1, 21, 1)],
	years: [new Params(50, 5, 0, 1)],
	centuries: [new Params(300, 1, 1900, centuriesFactor)]
}

function stringify(val){
	sval = val.toString();
	if(sval.length < 2) {
		sval = "0"+sval;
	}
	return sval;
}


function nextState(){
	var iSel = selector.value;
	switch(iSel){
		case "years":
			selector.value = "months";
			break;
		case centuriesLbl:
			selector.value = "years";
			break;
		default:
			selector.value = "days";
	}
}

function makeDigits(type){
	params = selectorParams[type];
	var disks = Observable();
	for(var ix in params){
		var prm = params[ix];
		var total = prm.to / prm.factor
		var delta = 360/total;
		for ( i = 0; i < total ; i++ ){
			var text = "";
			var angle = i * delta;
			var value = stringify(i*prm.factor + prm.offset);
			if (i  % prm.step == 0){
				text = value;
			}
			var cd = new ClockDigit(value, text, radius[ix], angle );
			disks.add(cd);
		}
	}
	return disks;
}


function ClockDigit(value, text, radius, angle){
	this.value = value
	this.text = text;
	this.radius = radius;
	this.angle = angle;
	var rad = - Math.PI*angle/180 + Math.PI/2;
	this.abs = Math.cos(rad)*radius;
	this.ord = - Math.sin(rad)*radius;
	this.line = radius*2;
	this.fill = Observable(transparent);
	this.centerFill = Observable(transparent);
	this.opacity=Observable(0);
}

function fillSelected(item){
	dateValue.forEach(function(dv){
		var ref = dv.ref[selector.value];
		if(item.value == ref) {
			item.fill.value = digitFill;
			item.opacity.value = lineOpacity;
			item.centerFill.value = centerFill;
		} else {
			item.fill.value = transparent;
			item.centerFill.value = transparent;
			item.opacity.value = 0
		}
	});
}

function setSelected(e){
	var value = e.data.item.value
	if(selector.value == centuriesLbl){
		selectorParams.years[0].update(value);
	}
	dateValue.value = dateValue.value.setValue(value);
	digits.forEach(fillSelected);
}

function cancel(){
	vstatus.value = false;
}

function confirm(e){
	dv = dateValue.value;
	dateTime.forEach(function(x){
		x.value = dv.toYMD();
	});
	vstatus.value = false;
}

//Modal management
var vstatus = Observable(false);

function showModal(label, date){
	pickerLabel.value = label;
	dateTime.value = date;
	vstatus.value = true;
}
this.show = showModal;
//


module.exports = {
	dateObj: dateValue,
	dateElement: dateElement, // to ensure reactivity
	selectorReact: selectorReact,
	bigCircle: bigCircle,
	wheelDigitsView: wheelDigitsView,
	selector: selector,
	setSelected: setSelected,
	nextState: nextState,
	cancel: cancel,
	confirm: confirm,
	visibleStatus: vstatus,
	showModal: showModal
}