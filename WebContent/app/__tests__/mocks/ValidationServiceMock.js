const promise = require("./helpers");
const ValidationServiceMock = {
	loadErrorMessages: function() {
			const response = {
			"E239": "Unfortunately&#44; the code is invalid. Please try again.",
			"E240": "Unfortunately&#44; your code is expired. You can request a new one by continuing to the next page.",
			"E241": "Unfortunately&#44; this option isn't available to Business customers. You'll need to enter details from your bill or log in to My Account to continue.",
			"E242": "Unfortunately&#44; we don't have a mobile number in our system. You'll need to enter details from your bill or log in to My Account to continue.",
			"E243": "Unfortunately&#44; you've had too many attempts. You'll need to enter details from your bill or log in to My Account to continue.",
			"E244": "Unfortunately&#44; you'll need to identify yourself another way. You'll be able to update your number when you complete your move online.",
			"MA_E45_2": "Please enter an amount no greater than"
		}
		return promise(response);
	}
};
module.exports = ValidationServiceMock;
