package io.packmule.cookies;

import java.util.Iterator;

import org.apache.cordova.CallbackContext;

import org.json.JSONException;
import org.json.JSONObject;

import com.github.kevinsawicki.http.HttpRequest;

public abstract class AbstractHttp
{
    protected String url;
    protected JSONObject headers;
    protected String data;
    protected CallbackContext callbackContext;

    public AbstractHttp(String url, JSONObject headers, String data, final CallbackContext callbackContext)
    throws JSONException
    {
        this.url = url;
        this.headers = headers;
        this.data = data;
        this.callbackContext = callbackContext;
    }

    protected void setHeadersFromJsonObject(HttpRequest request, JSONObject headers) throws JSONException
    {
        Iterator<?> keys = headers.keys();
        while(keys.hasNext()) {
            String key = (String) keys.next();
            request.header(key, (String) headers.get(key));
        }
    }

    protected void respondWithError(String msg)
    {
        try {
            JSONObject response = new JSONObject();
            response.put("status", 500);
            response.put("error", msg);

            this.callbackContext.error(response);
        } catch (JSONException e) {
            this.callbackContext.error(msg);
        }
    }
}
