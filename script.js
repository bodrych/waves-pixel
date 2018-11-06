var app = new Vue({
	el: '#app',
	data: {
		pixels: [],
		canvas: '3NBF3s2XEGGX7zy8pPxQWLZMEEwTP1ukwu1',
		node: 'https://testnode1.wavesnodes.com',
		publicKey: 'HeCW9krSqPM6AURLcgyj3PhHX3s742gPo8STVNQRM71P',
		fee: 500000,
		last: 0,
		maxHeight: 100,
		maxWidth: 100,
		cursor: {x: 0, y: 0},
		colors: [
			'#000000',
			'#7e7e7e',
			'#bebebe',
			'#ffffff',
			'#7e0000',
			'#fe0000',
			'#047e00',
			'#06ff04',
			'#ffff04',
			'#7e7e00',
			'#00007e',
			'#0000ff',
			'#7e007e',
			'#fe00ff',
			'#047e7e',
			'#06ffff'
		],
		color: 2
	},
	created: function() {
		this.update();
		setInterval(this.update, 1000);
	},
	methods: {
		colorClick: function(color) {
			this.color = color;
		},
		loadTxs: async function(limit) {
			let response = await axios.get(`${this.node}/transactions/address/${this.canvas}/limit/${limit}`);
			return response.data;
		},
		update: async function() {
			let lastTx = await this.loadTxs(1);
			let lastTime = lastTx[0][0].timestamp;
			if (lastTime != this.last) {
				let data = await this.getData();
				this.pixels = data.slice(0);
				this.last = lastTime.valueOf();
			}
		},
		offset: function(x, y) {
			let offset = (x - 1) + (y - 1) * this.maxWidth;
			return offset;
		},
		getXY: function(offset) {
			let x = offset % this.maxWidth;
			let y = Math.floor(offset / this.maxWidth);
			return {'x': x, 'y': y}
		},
		getData: async function() {
			let response = await axios.get(`${this.node}/addresses/data/${this.canvas}`);
			let data = response.data;
			let filtered = await data.filter(item => {
				let type = item.type;
				let value = item.value;
				let key = Number(item.key);
				let coords = this.getXY(key);
				return type == 'integer' && value >= 0 && value <= 15 && coords.x >=0 && coords.x < this.maxWidth && coords.y >=0 && coords.y < this.maxHeight;
			});
			let area = this.maxWidth * this.maxHeight;
			let arr = Array(area).fill(0);
			filtered.forEach(item => {
				let key = Number(item.key);
				let value = item.value;
				arr.splice(key, 1, value);
			});
			return arr;
		},
		setPixel: async function(offset, color) {
			let params = {
				version: 1,
				type: 12,
				data: [
					{
						type: 'integer',
						key: offset.toString(),
						value: color
					}
				],
				fee: this.fee,
				senderPublicKey: this.publicKey,
				proofs: [],
				timestamp: (new Date()).getTime()
			};
			try {
				let response = await axios.post(`${this.node}/transactions/broadcast`, params);
			} catch (err) {
				alert(err.message);
			}
		}
	}
});