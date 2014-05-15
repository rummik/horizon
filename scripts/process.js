function Process(options) {
	this.name         = options.name || 'UNKNOWN PROCESS';
	this.description  = options.description || '...';

	this.cost         = options.cost || -1;
	this.paid         = options.paid || -1;
	this.instructions = options.instructions || -1;
	this.materials    = options.materials || -1;
	this.timeout      = options.timeout || -1;

	var priority      = options.priority || 0;
	Object.defineProperties(this, {
		player: { writable: false, value: options.player },

		priority: {
			get: function() { return this.paused ? 21 : priority; },
			set: function(val) { priority = val > 20 ? 20 : val < -19 ? -19 : val; }
		},
	});

	var p = this;
	this.player.ontick(function(delta) {
		p.player.balance += delta.day * 12 * ((p.player.mips * p.activity) / 4600);
	});
}

Object.defineProperties(Process.prototype, {
	activity: { get: function() {
		return this.player.processes.activity(this.pid);
	} }
});


function ProcessTree(options) {
	Object.defineProperty(this, 'player', { writable: false, value: options.player });
}

ProcessTree.prototype = [];
ProcessTree.prototype.constructor = ProcessTree;

ProcessTree.prototype.add = function(options) {
	options = options || {};
	options.player = this.player;

	var process,
	    priority = 0,
	    pid = this.push(new Process(options));

	process = this[--pid];

	Object.defineProperty(process, 'pid', { value: pid, writable: false });

	return process;
};

ProcessTree.prototype.activity = function(pid) {
	var a = this.map(function(p) {
		return 41 - (20 + p.priority);
	}).reduce(function(a, b) {
		return a + b;
	});

	if (typeof pid != 'number')
		return a;

	return (41 - (20 + this[pid].priority)) / a;
};

module.exports = ProcessTree;
