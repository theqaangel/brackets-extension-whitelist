define(function (require, exports, module){
    var _ = target = $('body')[0],
        config = require('../config'),
        extensionService = require('./extensions'),
        dialogId = '.extension-manager-dialog.modal'

        var CommandManager = brackets.getModule('command/CommandManager');

    function init(){

        if(config.whitelist.length === 0)
        {
            disableExtensionManager();
        }

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

    function disableExtensionManager()
    {
        CommandManager.get("file.extensionManager").setEnabled(false);
        $("#toolbar-extension-manager").hide();
    }

    function dialogAddedMutation(mutation){
        var waitForRegistry = true;

        function registryUpdateAction(){
            waitForRegistry = false;
        }

        mutateInstallDropZone($(mutation.addedNodes[0]));

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

        mutateInfoMessage("NOTE: All listed extensions are verified.");

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

    function mutateInstallDropZone(target){
        target.find('#install-drop-zone').hide();
    }

    function mutateInfoMessage(text){

        if(typeof(text) !== 'undefined' && text.length > 0)
        {
            $('.info-message').html(text);
        }
        else
        {
            $('.info-message').hide();
        }
        
    }

    exports.init = init;
});
