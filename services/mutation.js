define(function (require, exports, module){
    var _ = target = $('body')[0],
        config = require('../config'),
        extensionService = require('./extensions'),
        dialogId = '.extension-manager-dialog.modal'

    function init(){
        var observer = new MutationObserver(function(mutations){
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes && mutation.addedNodes.length === 1){
                    dialogAddedMutation(mutation);
                }
            });
        }),
            observerConfig = config.mutationObserverConfig;
        observer.observe(target, observerConfig);
    }

    function dialogAddedMutation(mutation){
        var waitForRegistry = true;

        function registryUpdateAction(){
            waitForRegistry = false;
        }

        extensionService.updateRegistry()
            .then(registryUpdateAction, registryUpdateAction);

        var target = $(mutation.addedNodes[0]),
            token;

        if (target.find(dialogId).length === 1){

            token = setInterval(function(){
                var extensions = target.find('#registry tr, #installed tr, #themes tr'),
                    extensionCount = extensions.length;
                if (extensionCount < 200 || waitForRegistry){
                    return;
                }

                clearInterval(token);
                mutateExistingExtensions(extensions);
            }, 100);
        }
    }

    function mutateExistingExtensions(targets){
        if (targets.length === 0) return;

        for(var idx = 0; idx < targets.length; idx++){

            var target = targets[idx];
            var $t = $(target);
            var id = $t.find('[data-extension-id]').attr('data-extension-id');

            if(config.whitelist.indexOf(id) === -1)
            {
               $t.hide(); 
            }
        }
    }

    exports.init = init;
});
