package io.packmule.cookies;

import org.apache.cordova.CallbackContext;

import org.json.JSONException;
import org.json.JSONObject;

import com.github.kevinsawicki.http.HttpRequest;
import com.github.kevinsawicki.http.HttpRequest.HttpRequestException;

public class HttpGet extends AbstractHttp implements Runnable
{
    public HttpGet(String url, JSONObject headers, final CallbackContext callbackContext)
    throws JSONException
    {
        super(url, headers, "", callbackContext);
    }

    @Override
    public void run()
    {
        try {
            HttpRequest request = HttpRequest.get(url);
            this.setHeadersFromJsonObject(request, headers);
            int code = request.code();
            String body = request.body("UTF-8");
            JSONObject response = new JSONObject();
            response.put("status", code);
            if (code >= 200 && code < 300) {
                response.put("data", body);
                callbackContext.success(response);
            } else {
                response.put("error", body);
                callbackContext.error(response);
            }
        } catch (JSONException e) {
            this.respondWithError("There was an error generating the response");
        } catch (HttpRequestException e) {
            this.respondWithError("There was an error with the request");
        }
    }
}
