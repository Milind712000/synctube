exports.isURL = (link) => {
	try {
		link = new URL(link);
		return true;
	} catch (_) {
		return false;
	}
}

exports.getVideoID = (link) => {
	let url = new URL(link);
	return url.searchParams.get("v");
}