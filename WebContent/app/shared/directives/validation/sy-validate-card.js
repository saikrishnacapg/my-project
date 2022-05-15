angular.module('myaccount.directives').directive('syValidateCard', function ($log) {
	return {
		restrict: "A",
		require: 'ngModel',		
		link: function (scope, element, attrs, ctrl) {
			$log.log('');
			
			// taken from synergy website
			var checkCardLuhnAlgorthim = function(string){
				var luhnArr = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];    
				var counter = 0;    
				var incNum;        
				var odd = false;    
				var temp = String(string).replace(/[^\d]/g, "");    
				/*if (temp.length === 0){
					return false;
				}*/
				for (var i = temp.length-1; i >= 0; --i)        {    
					incNum = parseInt(temp.charAt(i), 10);    
					counter += (odd = !odd)? incNum : luhnArr[incNum];    
				}        
				var modulusResult = (counter%10);
				if(modulusResult === 0){
                    ctrl.$setValidity('syValidateCard', true);
                    return string;
                }else{
                    ctrl.$setValidity('syValidateCard', false);
                    $log.log('invalid!');
                    return undefined;
				}
			};	
			/*element.on('blur', function(e){
				checkCardLuhnAlgorthim(attrs.ngModel);
			});*/
			ctrl.$parsers.push(checkCardLuhnAlgorthim);

		}
	};
});
