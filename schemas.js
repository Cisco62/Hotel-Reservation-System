const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

//Stopping an unknown user from inserting there own <script>
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)
 
module.exports.reservationSchema = Joi.object({
    reservation: Joi.object({
        first_name: Joi.string().required().escapeHTML(),
        last_name: Joi.string().required().escapeHTML(),
        email: Joi.string().required().escapeHTML(),
        check_in_date: Joi.string().required().escapeHTML(),
        check_out_date: Joi.string().required().escapeHTML(),
        day_of_the_week: Joi.string().required().escapeHTML(),
        arrival_time: Joi.string().required().escapeHTML(),
        number_of_persons: Joi.number().required(),
        room_type: Joi.string().required().escapeHTML(),
        phone_number: Joi.number().required(),
    }).required()
});