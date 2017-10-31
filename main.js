function get(url, query) {
	return new Promise((resolve, reject) => {
		$.get(url, query).then((body) => {
			resolve(body);
		}).catch((error) => {
			reject(error);
		})
	});
}

function showResultsTable(output, data) {
	let first = data[0];
	let html = ``
	if (first) {
		let headers = Object.keys(first);
		html = `
			<thead>
				<tr>
		`;
		headers.forEach((key) => {
			html += `
					<th>${key}</th>
			`;
		});
		html += `
				</tr>
			</thead>
			<tbody>
		`;
		data.forEach((row) => {
			html += `
				<tr>
			`;
			headers.forEach((key) => {
				html += `
					<td>${row[key]}</td>
				`;
			});
			html += `
				</tr>
			`;
		});
		html += `
			</tbody>
		`;
	} else {
		html = `
			<tbody>
				<tr>
					<td>No Results.</td>
				</tr>
			</tbody>
		`;
	}
	output.innerHTML = html;
}

function showError(output, error) {
	let html = `
		<button class="delete"></button>
		<h2 class="title is-4">${error.code || error.errorCode || 'Error'}</h2>
		<p class="subtitle is-6">${error.message}</p>
	`;
	output.innerHTML = '';
	let div = document.createElement('div');
		div.classList.add('notification');
		div.classList.add('is-danger');
		div.innerHTML = html;
	output.appendChild(div);
	output.classList.remove('is-hidden');
	let closeBtn = div.querySelector('button.delete');
	closeBtn.addEventListener('click', (e) => {
		output.classList.add('is-hidden');
	});
}

function parseSoQL(text) {
	return {
		'$query': text.trim().split('\n').join(' ')
	}
}

function SoQLRequest(data) {
	let queryObj = parseSoQL(data.query);
	return get(data.url, queryObj);

}

let loading = document.getElementById('loading');
let danger = document.getElementById('error');
let input = document.getElementById('url');
let textarea = document.getElementById('query');
let button = document.getElementById('submit');
let table = document.getElementById('results');

function makeRequest() {
	table.innerHTML = ``;
	let value = getEditor().getSession().getValue();
	if (!input.value) {
		showError(danger, {
			code: 'Input Error',
			message: 'No data URL given.'
		});
	} else if (!value) {
		showError(danger, {
			code: 'Input Error',
			message: 'No SoQL query given.'
		});
	} else {
		table.classList.add('is-hidden');
		loading.classList.remove('is-hidden');
		button.classList.add('is-loading');
		danger.classList.add('is-hidden');
		SoQLRequest({
			url: input.value,
			query: value
		}).then((res) => {
			//console.log(res);
			table.classList.remove('is-hidden');
			loading.classList.add('is-hidden');
			button.classList.remove('is-loading');
			showResultsTable(table, res);
		}).catch((error) => {
			console.log(error);
			table.classList.remove('is-hidden');
			loading.classList.add('is-hidden');
			button.classList.remove('is-loading');
			showError(danger, error.responseJSON || {});
		});
	}
}

button.addEventListener('click', (e) => {
	makeRequest();
});

let editor = {};

function getEditor() {
	return editor;
}

// From: https://gist.github.com/duncansmart/5267653
$(function () {
	$('textarea[data-editor]').each(function () {
		var textarea = $(this);
		var mode = textarea.data('editor');
		var editDiv = $('<div>', {
			position: 'absolute',
			width: textarea.width(),
			height: textarea.height(),
			'class': textarea.attr('class')
		}).insertBefore(textarea);
		textarea[0].classList.add('is-hidden');
		editor = ace.edit(editDiv[0]);
		editor.renderer.setShowGutter(false);
		editor.getSession().setValue(textarea.val());
		editor.getSession().setMode("ace/mode/" + mode);
		editor.setTheme("ace/theme/monokai");
		editor.setOptions({
			fontSize: '15px',
			lineHeight: 1.5
		});
	});
});
