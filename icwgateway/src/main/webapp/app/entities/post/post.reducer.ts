import axios from 'axios';
import {
  ICrudSearchAction,
  parseHeaderForLinks,
  loadMoreDataWhenScrolled,
  ICrudGetAction,
  ICrudGetAllAction,
  ICrudPutAction,
  ICrudDeleteAction,
} from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IPost, defaultValue } from 'app/shared/model/post.model';

export const ACTION_TYPES = {
  SEARCH_POSTS: 'post/SEARCH_POSTS',
  FETCH_POST_LIST: 'post/FETCH_POST_LIST',
  FETCH_POST: 'post/FETCH_POST',
  CREATE_POST: 'post/CREATE_POST',
  UPDATE_POST: 'post/UPDATE_POST',
  DELETE_POST: 'post/DELETE_POST',
  SET_BLOB: 'post/SET_BLOB',
  RESET: 'post/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IPost>,
  entity: defaultValue,
  links: { next: 0 },
  updating: false,
  totalItems: 0,
  updateSuccess: false,
};

export type PostState = Readonly<typeof initialState>;

// Reducer

export default (state: PostState = initialState, action): PostState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.SEARCH_POSTS):
    case REQUEST(ACTION_TYPES.FETCH_POST_LIST):
    case REQUEST(ACTION_TYPES.FETCH_POST):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_POST):
    case REQUEST(ACTION_TYPES.UPDATE_POST):
    case REQUEST(ACTION_TYPES.DELETE_POST):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.SEARCH_POSTS):
    case FAILURE(ACTION_TYPES.FETCH_POST_LIST):
    case FAILURE(ACTION_TYPES.FETCH_POST):
    case FAILURE(ACTION_TYPES.CREATE_POST):
    case FAILURE(ACTION_TYPES.UPDATE_POST):
    case FAILURE(ACTION_TYPES.DELETE_POST):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.SEARCH_POSTS):
    case SUCCESS(ACTION_TYPES.FETCH_POST_LIST): {
      const links = parseHeaderForLinks(action.payload.headers.link);

      return {
        ...state,
        loading: false,
        links,
        entities: loadMoreDataWhenScrolled(state.entities, action.payload.data, links),
        totalItems: parseInt(action.payload.headers['x-total-count'], 10),
      };
    }
    case SUCCESS(ACTION_TYPES.FETCH_POST):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_POST):
    case SUCCESS(ACTION_TYPES.UPDATE_POST):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_POST):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {},
      };
    case ACTION_TYPES.SET_BLOB: {
      const { name, data, contentType } = action.payload;
      return {
        ...state,
        entity: {
          ...state.entity,
          [name]: data,
          [name + 'ContentType']: contentType,
        },
      };
    }
    case ACTION_TYPES.RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

const apiUrl = 'services/icwblog/api/posts';
const apiSearchUrl = 'services/icwblog/api/posts/search';

// Actions

export const getSearchEntities: ICrudSearchAction<IPost> = (keyword, page, size, sort) => ({
  type: ACTION_TYPES.SEARCH_POSTS,
  payload: axios.get<IPost>(`${apiSearchUrl}?keyword=${keyword}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`),
});

export const getEntities: ICrudGetAllAction<IPost> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_POST_LIST,
    payload: axios.get<IPost>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`),
  };
};

export const getEntity: ICrudGetAction<IPost> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_POST,
    payload: axios.get<IPost>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<IPost> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_POST,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  return result;
};

export const updateEntity: ICrudPutAction<IPost> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_POST,
    payload: axios.put(apiUrl, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IPost> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_POST,
    payload: axios.delete(requestUrl),
  });
  return result;
};

export const setBlob = (name, data, contentType?) => ({
  type: ACTION_TYPES.SET_BLOB,
  payload: {
    name,
    data,
    contentType,
  },
});

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
