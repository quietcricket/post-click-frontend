function _shuffle(arr) {
	var i = arr.length, j, temp;
	if (i == 0) return;
	while (--i) {
		j = Math.floor(Math.random() * (i + 1));
		temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
}
function _extract_data(pattern, sheetData, multipleValues) {
	let arr = []
	for (let i = 0; i < sheetData.length; i++) {
		if (sheetData[i][0].trim().match(pattern)) {
			arr.push(sheetData[i].splice(1));
		}
	}
	if (arr.length == 0) {
		return '';
	}
	if (multipleValues) {
		return arr
	}
	return arr[0][0];
}
