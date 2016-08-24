/**
     * @fileOverview Custom selector that limits filetypes and filesize of uploads.
     * @author Michael Rhyndress
     * @version 1.0
     * @Created 10/19/2015
     * @Modified 10/20/2015
*/
jQuery.fn.filteredFileSelector = function (options) {
    "use strict";
    /**
    * Initialize the defaults
    */
    var defaults = {
        filetypes: [], //Filetypes accepted, default will be all. Array is best, list will be broken into one.
        max_size: $('#MaxFileSize').val(), // Max file size to accept, defautl 2mb
        error_field: undefined, // place to display errors
        success_field: undefined, // place to display success html
        filename_field: undefined, // place to display filename
        filesize_field : undefined, // place to display filesize
        filetype_error: $('#FileTypeError').val(),      // Default filetype error
        filesize_error: $('#FileSizeError').val(),  // Default filesize error, defined later
        success_message: 'Thank You!' //Success message, in native html. Supports icons!
    }; var settings = $.extend({}, defaults, options);

    $('#fileSize').html(settings.max_size);

    /**
     * if filetypes are given as a string, remove spaces and special chars
     * then break into array.
     */
    if ($.type(settings.filetypes) === "string") {
        if (settings.filetypes === "") {
            settings.filetypes = [];
        } else {
            settings.filetypes = settings.filetypes.replace(/[\. .:-]+/g, "").split(',');
        }
    }

    if (settings.filesize_error === "") {
        settings.filesize_error = 'The file must be ' + settings.max_size + ' megabytes or less.';
    }


    /**
     * LEGACY Support
     */

    function msieversion() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        if (msie > 0) { // If Internet Explorer, return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
        }
        else { // If another browser, return 0
            return 0;
        }
    }

    /**
     *  Convert Megabytes to Bytes
     *  @param { int/float} mb - Number, in MB, to convert to Bytes
     *  @returns { int/float }
     */
    var MbtoB = function (mb) { return ((mb * 1024) * 1024); };

    /**
     *  Convert Bytes to Megabytes
     *  @param { int } b - Number, in B, to convert to MB
     *  @returns { int/float }
     */
    var BtoMb = function (b) { return ((b / 1024) / 1024); };

    /**
        Remove the error from the error_field if it exists.
    */
    var removeError = function () {
        if( $(settings.error_field) !== undefined ){ $(settings.error_field).text(""); }
        return;
    };

    var removeSuccess = function () {
        if ($(settings.success_field) !== undefined) { $(settings.success_field).text(""); }
        if ($(settings.filename_field) !== undefined) { $(settings.filename_field).text(""); }
        if ($(settings.filesize_field) !== undefined) { $(settings.filesize_field).text(""); }
        return;
    };

    /**
     * Send an error to the error_field, if it exists in settings.
     * Also resets the input field.
     * @param { obj } obj - The instance object, usually $(this)
     * @param { string } e - Error message to pass to error field
     */
    var invalid = function (obj, e) {
        removeSuccess();
        obj.val("");
        if ($(settings.error_field) !== undefined) { $(settings.error_field).text(e); }
        return;
    }

    /**
     * Removes any invalid triggere events.
     * Send an msg to the success_field, if it exists in settings.
     * Sets the filename and filesize to the given fields, if exist
     * @param { string } filename - The filename of selected to print to filetype_field
     * @param { int/float } filesize - Filesize, typically in MB to print out to filesize_field
     * @param { string } msg - Msg to print on success, can be any valid Html
     */
    var success = function (filename, filesize, msg) {
        removeError();
        if ($(settings.success_field) !== undefined) { $(settings.success_field).html(msg); }
        if ($(settings.filename_field) !== undefined) { $(settings.filename_field).text(filename); }
        if ($(settings.filesize_field) !== undefined) { $(settings.filesize_field).text(filesize); }
        return;
    }

    /**
        Set the accept attribute on the field being
        affected by this function. To do this, loop
        through the accepted filetypes and associate
        to the map of ext => MIMES to figure
        out which to use. MIME is the most cross
        browser way of doing this.
    */
    if (settings.filetypes.length !== 0) {
        var acceptedMIME = [];
        var extToMimes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'pps': 'application/vnd.ms-powerpoint',
            'ppsx': 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
            'odt': 'application/vnd.oasis.opendocument.text',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'zip': 'application/zip',
            'csv': 'text/csv',
            'html': 'text/html',
            'xlsb': 'application/vnd.ms-excel.sheet.binary.macroenabled.12',
            'pub': 'application/x-mspublisher',
            'psd': 'image/vnd.adobe.photoshop',
            'rtf': 'application/rtf',
            'txt': 'text/plain',
            'xslt': 'text/xml',
            'xsl': 'text/xml'
        };

        $.each(settings.filetypes, function (i, ext) {
            acceptedMIME.push(extToMimes[ext]);
        });
        $(this).attr("accept", acceptedMIME.join(","));
    }

    /**
        When a file is selected, check the following:
            1. That the filetype is correct
            2. That the filesize is below the
                max_size setting.
    */
    $(this).on("change", function () {
        var fsize = 0;
        var filename = $(this).val();
        var filetype = filename.split('.').pop().toLowerCase();
        if (settings.filetypes.length !== 0 && $.inArray(filetype, settings.filetypes) === -1) {
            invalid($(this), settings.filetype_error);
            return;
        }
        var isIE = msieversion();
        if (isIE !== 0 && isIE < 11) {
            var objFSO = new ActiveXObject("Scripting.FileSystemObject"); var filePath = $(this)[0].value;
            var objFile = objFSO.getFile(filePath);
            fsize = objFile.size; //size in kb
            fsize = fsize / 1048576; //size in mb
            fsize = MbtoB(fsize); //we need bytes (or rework the code for mb)
        } else {
            fsize = this.files[0].size;
        }
        if (fsize > MbtoB(settings.max_size)) {
            invalid($(this), settings.filesize_error);
            return;
        }
        filename = filename.split('\\').pop();
        success(filename, BtoMb(fsize).toFixed(2), settings.success_message);
    });
};
