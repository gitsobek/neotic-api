import User from '../../models/user';
import qs from 'qs';
import _ from 'lodash';

export default function getFilters(req, res, next) {
    const availableFilters = Object.keys(User.schema.paths);
    const filters = qs.parse(req.query);

    const schemaFilters = _.pickBy(filters, (value, key) => availableFilters.indexOf(key) > -1);
    let searchFilter = {};
    if (filters.q) {
        searchFilter = {
            $text: {
                $search: filters.q
            }
        }
    }

    req.filters = { ...searchFilter, ...schemaFilters };
    next();
}